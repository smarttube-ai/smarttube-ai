import React, { useState } from 'react';
import { useFeatureLimit } from '../hooks/useFeatureLimit';
import { FEATURE_KEYS } from '../lib/feature-limits';

export default function FeatureLimitExample() {
  const { 
    usage, 
    loading, 
    error, 
    use, 
    canUse, 
    formatUsage, 
    isUnlimited,
    remaining
  } = useFeatureLimit(FEATURE_KEYS.SCRIPTING);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [limitExceeded, setLimitExceeded] = useState(false);
  
  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setLimitExceeded(false);
    
    try {
      // First check if we can use this feature
      const canProceed = await use({ action: 'generate_script' });
      
      if (!canProceed) {
        setLimitExceeded(true);
        return;
      }
      
      // If we got here, we can generate a script
      // Simulate API call to generate script
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResult('Your generated script would appear here!');
    } catch (err) {
      console.error('Error generating script:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Loading state
  if (loading) {
    return <div className="p-4">Loading feature limits...</div>;
  }
  
  // Error state
  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }
  
  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Script Generator</h2>
      
      <div className="mb-4">
        <p className="text-gray-300">
          {isUnlimited ? (
            <span className="text-green-400">
              You have unlimited access to script generation this month!
            </span>
          ) : (
            <span>
              You have used <span className="font-bold">{usage?.current_usage || 0}</span> of{' '}
              <span className="font-bold">{usage?.limit_value || 0}</span> scripts this month.
              <span className="ml-2">
                {remaining > 0 ? (
                  <span className="text-green-400">({remaining} remaining)</span>
                ) : (
                  <span className="text-red-400">(Limit reached)</span>
                )}
              </span>
            </span>
          )}
        </p>
      </div>
      
      <div className="mb-6">
        <button
          onClick={handleGenerateScript}
          disabled={isGenerating || !canUse}
          className={`px-4 py-2 rounded-md ${
            canUse
              ? 'bg-[#2762EB] text-white hover:bg-[#2762EB]/90'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          } transition-colors`}
        >
          {isGenerating
            ? 'Generating...'
            : !canUse
            ? 'Limit Reached'
            : 'Generate Script'}
        </button>
      </div>
      
      {limitExceeded && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-md">
          <h3 className="text-red-400 font-medium mb-2">Feature Limit Reached</h3>
          <p className="text-gray-300">
            You have reached your monthly limit for script generation.
            Upgrade your plan to generate more scripts.
          </p>
          <button className="mt-3 px-4 py-1.5 bg-[#2762EB] text-white rounded-md hover:bg-[#2762EB]/90 transition-colors">
            Upgrade Plan
          </button>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-gray-800 rounded-md">
          <h3 className="text-green-400 font-medium mb-2">Generated Script</h3>
          <p className="text-gray-300 whitespace-pre-line">{result}</p>
        </div>
      )}
    </div>
  );
} 