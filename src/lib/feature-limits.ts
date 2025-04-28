import { supabase } from './supabase';

export interface FeatureUsage {
  limit_value: number;
  current_usage: number;
  remaining: number;
  is_unlimited: boolean;
}

export interface FeatureLimit {
  id: string;
  key: string;
  name: string;
  description: string | null;
  default_value: number;
}

export const FEATURE_KEYS = {
  SCRIPTING: 'Scripting Tool',
  IDEATION: 'Ideation Tool',
  YOUTUBE_TOOLS: 'YouTube Tools',
  TITLE_GENERATOR: 'Title Generator',
  DESCRIPTION_GENERATOR: 'Description Generator',
  HASHTAG_GENERATOR: 'Hashtag Generator',
  KEYWORD_IDEAS: 'Keyword Ideas',
  VIDEO_HOOK_GENERATOR: 'Video Hook Generator',
  TITLE_AB_TESTER: 'Title A/B Tester',
  DESCRIPTION_OPTIMIZER: 'Description Optimizer',
  SUPPORT: 'Support'
};

/**
 * Get a user's current usage for a specific feature
 */
export async function getFeatureUsage(featureKey: string): Promise<FeatureUsage | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_feature_usage', { feature_key: featureKey });
    
    if (error) {
      console.error('Error getting feature usage:', error);
      return null;
    }
    
    return data[0] || null;
  } catch (error) {
    console.error('Error in getFeatureUsage:', error);
    return null;
  }
}

/**
 * Check and record usage of a feature
 * Returns true if the feature can be used, false if limit reached
 */
export async function useFeature(
  featureKey: string, 
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('use_feature', { 
        feature_key: featureKey,
        metadata: metadata
      });
    
    if (error) {
      console.error('Error using feature:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in useFeature:', error);
    return false;
  }
}

/**
 * Get all feature limits
 */
export async function getAllFeatureLimits(): Promise<FeatureLimit[]> {
  try {
    const { data, error } = await supabase
      .from('feature_limits')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error getting feature limits:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllFeatureLimits:', error);
    return [];
  }
}

/**
 * Get a user's current usage for all features
 */
export async function getAllFeatureUsage(): Promise<Record<string, FeatureUsage>> {
  try {
    const featureLimits = await getAllFeatureLimits();
    const usagePromises = featureLimits.map(limit => 
      getFeatureUsage(limit.key).then(usage => ({ key: limit.key, usage }))
    );
    
    const usageResults = await Promise.all(usagePromises);
    
    return usageResults.reduce((acc, { key, usage }) => {
      if (usage) {
        acc[key] = usage;
      }
      return acc;
    }, {} as Record<string, FeatureUsage>);
  } catch (error) {
    console.error('Error in getAllFeatureUsage:', error);
    return {};
  }
}

/**
 * Helper to format usage display
 */
export function formatUsage(usage: FeatureUsage | null): string {
  if (!usage) return 'Unknown';
  if (usage.is_unlimited) return 'Unlimited';
  return `${usage.current_usage} / ${usage.limit_value}`;
}

/**
 * Check if feature can be used without actually recording usage
 */
export async function canUseFeature(featureKey: string): Promise<boolean> {
  const usage = await getFeatureUsage(featureKey);
  if (!usage) return false;
  if (usage.is_unlimited) return true;
  return usage.remaining > 0;
}

/**
 * React hook wrapper for feature usage (example)
 * This would be implemented in a separate hooks file
 */
/*
import { useState, useEffect } from 'react';

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
    return await useFeature(featureKey, metadata);
  };
  
  return { usage, loading, error, use, canUse: usage?.remaining ? usage.remaining > 0 : false };
}
*/ 