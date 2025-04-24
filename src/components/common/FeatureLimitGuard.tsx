import React, { ReactNode } from 'react';
import { useLimit } from '../../hooks/useLimit';

interface FeatureContextProps {
  useFeature: () => Promise<void>;
  remainingUsage: number;
}

interface FeatureLimitGuardProps {
  featureKey: string;
  children: ReactNode | ((props: FeatureContextProps) => ReactNode);
  fallback?: ReactNode;
}

/**
 * A component that wraps a feature and only renders it if the user has not reached their usage limit
 */
export const FeatureLimitGuard: React.FC<FeatureLimitGuardProps> = ({
  featureKey,
  children,
  fallback,
}) => {
  const { checkLimit, incrementUsage, getRemainingUsage, loading } = useLimit();
  
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  const canUseFeature = checkLimit(featureKey);
  const remainingUsage = getRemainingUsage(featureKey);
  
  if (!canUseFeature) {
    return (
      fallback || (
        <div className="p-6 text-center bg-[#121826] rounded-lg border border-[#2D3748]">
          <h3 className="text-lg font-medium mb-2">Feature Limit Reached</h3>
          <p className="text-gray-400 mb-4">
            You've reached your daily limit for this feature.
          </p>
          <button
            className="px-4 py-2 bg-[#2762EB] text-white rounded-md"
            onClick={() => window.location.href = '/pricing'}
          >
            Upgrade Your Plan
          </button>
        </div>
      )
    );
  }
  
  // Function to use the feature and increment usage
  const useFeature = async () => {
    await incrementUsage(featureKey);
  };
  
  // Pass the useFeature function and remaining usage to children if it's a function
  if (typeof children === 'function') {
    return (children as (props: FeatureContextProps) => ReactNode)({ 
      useFeature, 
      remainingUsage 
    });
  }
  
  return <>{children}</>;
};

export default FeatureLimitGuard; 