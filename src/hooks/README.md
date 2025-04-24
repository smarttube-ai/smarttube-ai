# Hooks

This directory contains reusable React hooks for the application.

## useLimit

`useLimit` is a hook for managing feature limits based on user subscription plans.

### Basic Usage

```tsx
import { useLimit } from '@/hooks/useLimit';

function MyFeature() {
  const { checkLimit, incrementUsage, getRemainingUsage } = useLimit();
  
  // Check if user can use the feature
  const canUseFeature = checkLimit('feature_key');
  
  // Get remaining usage count
  const remaining = getRemainingUsage('feature_key');
  
  const handleUseFeature = async () => {
    // Increment usage when feature is used
    await incrementUsage('feature_key');
    // Perform feature action
  };
  
  if (!canUseFeature) {
    return <UpgradePlanMessage />;
  }
  
  return (
    <div>
      <p>You have {remaining} uses remaining today</p>
      <button onClick={handleUseFeature}>Use Feature</button>
    </div>
  );
}
```

### Using the FeatureLimitGuard Component

For convenience, you can use the `FeatureLimitGuard` component to wrap features with usage limits:

```tsx
import FeatureLimitGuard from '@/components/common/FeatureLimitGuard';

function MyPage() {
  return (
    <div>
      <h1>My Feature</h1>
      
      <FeatureLimitGuard featureKey="video_ideas">
        <VideoIdeasGenerator />
      </FeatureLimitGuard>
      
      {/* With custom fallback */}
      <FeatureLimitGuard 
        featureKey="seo_analysis"
        fallback={<PremiumFeaturePromo feature="SEO Analysis" />}
      >
        <SeoAnalysisTool />
      </FeatureLimitGuard>
      
      {/* With function pattern to access useFeature and remainingUsage */}
      <FeatureLimitGuard featureKey="content_generation">
        {({ useFeature, remainingUsage }) => (
          <ContentGenerator 
            onGenerate={useFeature}
            remainingCount={remainingUsage}
          />
        )}
      </FeatureLimitGuard>
    </div>
  );
}
```

### How Limits Work

1. Limits are defined in subscription plans in the `features` object 
2. Each feature has a numeric limit (uses per day)
3. Special values:
   - `0`: Feature is disabled
   - `-1`: Unlimited usage
4. Usage counts reset daily
5. Custom overrides can be set per user in the `custom_limits` field

See the Plans and Limits admin panels for management. 