import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Save, 
  Loader2, 
  Package, 
  AlertTriangle,
  Info,
  BarChart3
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  features: Record<string, number>;
}

interface GlobalLimit {
  id: string;
  key: string;
  name: string;
  description: string;
  default_value: number;
}

type ToastType = 'success' | 'error';

interface ToastState {
  open: boolean;
  message: string;
  type: ToastType;
}

const LimitsAdmin: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [globalLimits, setGlobalLimits] = useState<GlobalLimit[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planLimits, setPlanLimits] = useState<Record<string, Record<string, number>>>({});
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', type: 'success' });
  const [newFeature, setNewFeature] = useState({ key: '', name: '', description: '', default_value: 0 });
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('id, name, features')
        .order('price', { ascending: true });
      
      if (plansError) throw plansError;
      
      // Fetch global feature limits
      const { data: limitsData, error: limitsError } = await supabase
        .from('feature_limits')
        .select('*')
        .order('name', { ascending: true });
      
      if (limitsError) throw limitsError;
      
      setPlans(plansData || []);
      setGlobalLimits(limitsData || []);
      
      // Build available features list
      const allFeatures = new Set<string>();
      
      // Add features from global limits
      limitsData?.forEach(limit => allFeatures.add(limit.key));
      
      // Add features from plans
      plansData?.forEach(plan => {
        if (plan.features) {
          Object.keys(plan.features).forEach(key => allFeatures.add(key));
        }
      });
      
      setAvailableFeatures(Array.from(allFeatures));
      
      // Prepare plan limits for editing
      const limitsObj: Record<string, Record<string, number>> = {};
      plansData?.forEach(plan => {
        limitsObj[plan.id] = plan.features || {};
      });
      
      setPlanLimits(limitsObj);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLimitChange = (planId: string, feature: string, value: number) => {
    setPlanLimits(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [feature]: value
      }
    }));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Update each plan with new limits
      const updates = plans.map((plan) => 
        supabase
          .from('plans')
          .update({ features: planLimits[plan.id] })
          .eq('id', plan.id)
      );
      
      await Promise.all(updates);
      showToast('Feature limits updated successfully', 'success');
    } catch (error) {
      console.error('Error saving limits:', error);
      showToast('Failed to update feature limits', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addNewFeature = async () => {
    if (!newFeature.key || !newFeature.name) {
      showToast('Feature key and name are required', 'error');
      return;
    }
    
    try {
      // Add to feature_limits table
      const { error } = await supabase
        .from('feature_limits')
        .insert({
          key: newFeature.key,
          name: newFeature.name,
          description: newFeature.description,
          default_value: newFeature.default_value
        });
      
      if (error) throw error;
      
      // Reset form
      setNewFeature({ key: '', name: '', description: '', default_value: 0 });
      
      // Refresh data
      fetchData();
      showToast('New feature limit added successfully', 'success');
    } catch (error) {
      console.error('Error adding feature:', error);
      showToast('Failed to add feature limit', 'error');
    }
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Feature Limits</h1>
        <button
          onClick={saveChanges}
          disabled={saving || loading}
          className="bg-white text-[#020817] px-4 py-2 rounded-md flex items-center hover:bg-white/90 transition-colors"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart3 size={20} className="mr-2 text-[#2762EB]" />
              Plan Feature Limits
            </h2>
            
            {loading ? (
              <div className="flex justify-center my-12">
                <div className="w-10 h-10 border-4 border-t-[#2762EB] border-[#1E293B] rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {plans.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No plans found</p>
                    <p className="text-sm mt-2">Create plans in the Plans Management section first</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-3 bg-card border-b border-border">Feature</th>
                          {plans.map((plan) => (
                            <th key={plan.id} className="text-center p-3 bg-card border-b border-border">
                              {plan.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {availableFeatures.map((feature) => {
                          // Find global limit info if available
                          const limitInfo = globalLimits.find(limit => limit.key === feature);
                          
                          return (
                            <tr key={feature} className="border-b border-border hover:bg-card">
                              <td className="p-3">
                                <div className="flex items-start">
                                  <div>
                                    <div className="font-medium">
                                      {limitInfo?.name || feature}
                                      {limitInfo && (
                                        <span className="text-xs text-gray-500 ml-2">({feature})</span>
                                      )}
                                    </div>
                                    {limitInfo?.description && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        {limitInfo.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              
                              {plans.map((plan) => (
                                <td key={`${plan.id}-${feature}`} className="p-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={planLimits[plan.id]?.[feature] || 0}
                                    onChange={(e) => handleLimitChange(
                                      plan.id, 
                                      feature, 
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="input w-20"
                                  />
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                        
                        {availableFeatures.length === 0 && (
                          <tr>
                            <td colSpan={plans.length + 1} className="p-6 text-center text-gray-400">
                              No features defined yet. Add a new feature below.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Feature</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Feature Key
                </label>
                <input
                  type="text"
                  value={newFeature.key}
                  onChange={(e) => setNewFeature({...newFeature, key: e.target.value})}
                  placeholder="e.g. video_ideas"
                  className="input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier, use snake_case
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature({...newFeature, name: e.target.value})}
                  placeholder="e.g. Video Ideas"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                  placeholder="e.g. Number of video ideas per day"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Default Value
                </label>
                <input
                  type="number"
                  min="0"
                  value={newFeature.default_value}
                  onChange={(e) => setNewFeature({...newFeature, default_value: parseInt(e.target.value) || 0})}
                  className="input w-full"
                />
              </div>
              
              <button
                onClick={addNewFeature}
                className="w-full bg-white text-[#020817] px-4 py-2 rounded-md mt-2 hover:bg-white/90 transition-colors"
              >
                Add Feature
              </button>
            </div>
            
            <div className="mt-6 bg-card p-4 rounded-md border border-border">
              <div className="flex items-start">
                <Info size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-gray-400">
                  <p className="mb-2">
                    Feature limits define how many times a user can use a specific feature
                    based on their subscription plan.
                  </p>
                  <p>
                    Example: Setting "video_ideas" to 10 for Basic plan means users on that 
                    plan can generate up to 10 video ideas per day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage Explanation Card */}
      <div className="card p-6">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">Feature Limits Usage Guide</h3>
            <p className="text-gray-400 mt-2">
              To use these limits in your application code, access them using the plan's features property:
            </p> 
            <div className="bg-card p-4 rounded-md mt-3 font-mono text-sm">
              <div className="text-gray-300">
                <div><span className="text-yellow-500">const</span> <span className="text-blue-400">userPlan</span> = <span className="text-yellow-500">await</span> supabase.from(<span className="text-green-400">'user_plans'</span>).select(<span className="text-green-400">'*, plans(*)'</span>).eq(<span className="text-green-400">'user_id'</span>, userId).single();</div>
                <div className="mt-1"><span className="text-yellow-500">const</span> <span className="text-blue-400">featureLimits</span> = userPlan?.plans?.features || {"{}"}</div>
                <div className="mt-1"><span className="text-yellow-500">const</span> <span className="text-blue-400">maxIdeas</span> = featureLimits.video_ideas || <span className="text-purple-400">0</span>;</div>
                <div className="mt-3 text-gray-500">// Then check against usage:</div>
                <div className="mt-1"><span className="text-yellow-500">if</span> (userDailyUsage.video_ideas &lt; maxIdeas) {"{"}</div>
                <div className="ml-4">// Allow the user to use the feature</div>
                <div>{"}"}</div>
              </div>
            </div>
            <h3 className="text-lg font-medium mt-8">Usage in your application code:</h3>
            <div className="bg-card p-4 rounded-md text-sm mt-2">
              <pre className="text-gray-200">
{`// In your feature component:
import { useLimit } from '@/hooks/useLimit';

function VideoIdeasGenerator() {
  const { checkLimit } = useLimit();
  
  // Check if user can use the feature
  const canUseFeature = checkLimit('video_ideas');
  
  if (!canUseFeature) {
    return <UpgradePlanMessage />;
  }
  
  return (
    // Your feature UI
  );
}`}
              </pre>
            </div>
            <p className="text-gray-400 mt-3">
              Remember to check for custom overrides in the <span className="font-mono text-xs bg-card px-2 py-1 rounded">custom_limits</span> field 
              of the user_plans table, which can override the plan's default limits.
            </p>
          </div>
        </div>
      </div>
      
      {/* Simple Toast Notification */}
      {toast.open && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${
          toast.type === 'success' ? 'bg-green-800' : 'bg-red-800'
        } text-white max-w-sm z-50`}>
          <div className="font-medium">
            {toast.type === 'success' ? 'Success' : 'Error'}
          </div>
          <div className="mt-1 text-sm">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default LimitsAdmin; 