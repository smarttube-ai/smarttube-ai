import { useState, useEffect } from 'react';
import { 
  getFeatureUsage, 
  useFeature, 
  FeatureUsage 
} from '../lib/feature-limits';

export function useFeatureLimit(featureKey: string) {
  const [usage, setUsage] = useState<FeatureUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoading(true);
        const data = await getFeatureUsage(featureKey);
        setUsage(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsage();
  }, [featureKey]);
  
  const use = async (metadata = {}) => {
    const result = await useFeature(featureKey, metadata);
    // Refresh usage after using a feature
    if (result) {
      const newUsage = await getFeatureUsage(featureKey);
      setUsage(newUsage);
    }
    return result;
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getFeatureUsage(featureKey);
      setUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  return { 
    usage, 
    loading, 
    error, 
    use,
    refresh,
    // Helper properties
    canUse: usage?.is_unlimited || (usage?.remaining ?? 0) > 0,
    isUnlimited: usage?.is_unlimited || false,
    remaining: usage?.remaining ?? 0,
    usageCount: usage?.current_usage ?? 0,
    limit: usage?.limit_value ?? 0,
    formatUsage: () => {
      if (!usage) return 'Unknown';
      if (usage.is_unlimited) return 'Unlimited';
      return `${usage.current_usage} / ${usage.limit_value}`;
    }
  };
} 