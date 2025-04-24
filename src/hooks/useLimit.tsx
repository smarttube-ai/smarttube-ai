import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LimitUsage {
  feature: string;
  count: number;
  last_reset: string;
}

interface UserPlan {
  id: string;
  user_id: string;
  plan_id: string;
  expiry: string | null;
  custom_limits: Record<string, number> | null;
  plans: {
    id: string;
    name: string;
    price: number;
    features: Record<string, number>;
    is_active: boolean;
  };
  profile?: {
    role: string;
  };
}

export function useLimit() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [usageData, setUsageData] = useState<Record<string, LimitUsage>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchUserPlanAndUsage = async () => {
      setLoading(true);
      try {
        // Fetch user's plan with features and profile
        const { data: userPlanData, error: planError } = await supabase
          .from('user_plans')
          .select('*, plans(*), profile:profiles!user_plans_user_id_fkey(role)')
          .eq('user_id', user.id)
          .single();
        
        if (planError) throw planError;
        setUserPlan(userPlanData);
        
        // Check if user is admin
        const isUserAdmin = userPlanData?.profile?.role === 'admin';
        setIsAdmin(isUserAdmin);
        
        // Fetch user's current feature usage
        const { data: usageRecords, error: usageError } = await supabase
          .from('feature_usage')
          .select('*')
          .eq('user_id', user.id);
          
        if (usageError) throw usageError;
        
        // Convert to a more usable format
        const usageMap: Record<string, LimitUsage> = {};
        usageRecords?.forEach(record => {
          usageMap[record.feature] = {
            feature: record.feature,
            count: record.count,
            last_reset: record.last_reset
          };
        });
        
        setUsageData(usageMap);
      } catch (error) {
        console.error('Error fetching user plan or usage:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPlanAndUsage();
  }, [user?.id]);
  
  const incrementUsage = useCallback(async (feature: string) => {
    if (!user?.id) return false;
    
    // Admins don't need to track usage
    if (isAdmin) return true;
    
    const today = new Date().toISOString().split('T')[0];
    const usage = usageData[feature];
    
    try {
      if (!usage) {
        // First time using this feature
        const { error } = await supabase
          .from('feature_usage')
          .insert({
            user_id: user.id,
            feature,
            count: 1,
            last_reset: today
          });
          
        if (error) throw error;
        
        // Update local state
        setUsageData(prev => ({
          ...prev,
          [feature]: { feature, count: 1, last_reset: today }
        }));
      } else {
        // Check if we need to reset the counter (new day)
        if (usage.last_reset !== today) {
          // Reset counter for a new day
          const { error } = await supabase
            .from('feature_usage')
            .update({ count: 1, last_reset: today })
            .eq('user_id', user.id)
            .eq('feature', feature);
            
          if (error) throw error;
          
          // Update local state
          setUsageData(prev => ({
            ...prev,
            [feature]: { ...prev[feature], count: 1, last_reset: today }
          }));
        } else {
          // Increment the existing counter
          const { error } = await supabase
            .from('feature_usage')
            .update({ count: usage.count + 1 })
            .eq('user_id', user.id)
            .eq('feature', feature);
            
          if (error) throw error;
          
          // Update local state
          setUsageData(prev => ({
            ...prev,
            [feature]: { ...prev[feature], count: prev[feature].count + 1 }
          }));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing feature usage:', error);
      return false;
    }
  }, [user?.id, usageData, isAdmin]);
  
  const checkLimit = useCallback((feature: string): boolean => {
    if (!user?.id || !userPlan) return false; // No user or plan means no access
    
    // Admins bypass all limits
    if (isAdmin) return true;
    
    const today = new Date().toISOString().split('T')[0];
    const usage = usageData[feature];
    
    // Get the feature limit from the plan
    const planFeatures = userPlan.plans?.features || {};
    
    // Check for custom overrides specific to this user
    const customLimits = userPlan.custom_limits || {};
    
    // Use custom limit if available, otherwise use plan limit
    const limit = customLimits[feature] !== undefined 
      ? customLimits[feature] 
      : planFeatures[feature] || 0;
    
    // If limit is 0 or negative, feature is disabled
    if (limit <= 0) return false;
    
    // If limit is -1, unlimited usage
    if (limit === -1) return true;
    
    // If no usage record or it's from a different day, user hasn't used the feature today
    if (!usage || usage.last_reset !== today) return true;
    
    // Check if user has reached their limit
    return usage.count < limit;
  }, [user?.id, userPlan, usageData, isAdmin]);
  
  const getRemainingUsage = useCallback((feature: string): number => {
    if (!user?.id || !userPlan) return 0;
    
    // Admins have unlimited usage
    if (isAdmin) return -1;
    
    // Get the feature limit from the plan
    const planFeatures = userPlan.plans?.features || {};
    
    // Check for custom overrides specific to this user
    const customLimits = userPlan.custom_limits || {};
    
    // Use custom limit if available, otherwise use plan limit
    const limit = customLimits[feature] !== undefined 
      ? customLimits[feature] 
      : planFeatures[feature] || 0;
      
    // If limit is -1, unlimited usage
    if (limit === -1) return -1;
    
    const today = new Date().toISOString().split('T')[0];
    const usage = usageData[feature];
    
    // If no usage record or it's from a different day, user hasn't used the feature today
    if (!usage || usage.last_reset !== today) return limit;
    
    // Calculate remaining usage
    return Math.max(0, limit - usage.count);
  }, [user?.id, userPlan, usageData, isAdmin]);
  
  return {
    checkLimit,
    incrementUsage,
    getRemainingUsage,
    userPlan,
    isAdmin,
    loading
  };
} 