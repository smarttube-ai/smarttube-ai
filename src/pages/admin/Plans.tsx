import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Pencil, 
  Trash2,
  Package, 
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: Record<string, number>;
  is_active: boolean;
  user_count?: number;
  description?: string;
}

interface PlanFormData {
  name: string;
  price: number;
  features: string;
  is_active: boolean;
  description: string;
}

interface ToastState {
  open: boolean;
  message: string;
  type: 'success' | 'error';
}

const PlansAdmin: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price: 0,
    features: '{}',
    is_active: true,
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PlanFormData, string>>>({});
  const [toast, setToast] = useState<ToastState>({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetchPlans();
  }, []);

  // Add the three default plans if none exist
  const addDefaultPlans = async () => {
    try {
      // Define the new plan structures
      const plans = [
        {
          name: 'Free',
          price: 0,
          features: {
            "Scripting Tool": 7,
            "Ideation Tool": 4,
            "YouTube Tools": 12,
            "Title Generator": 12,
            "Description Generator": 12,
            "Hashtag Generator": 15,
            "Keyword Ideas": 15,
            "Video Hook Generator": 10,
            "Title A/B Tester": 10,
            "Description Optimizer": 10,
            "Support": 0
          },
          is_active: true,
          description: 'Get Started with Basic Tools for Content Creation.'
        },
        {
          name: 'Basic',
          price: 9.99,
          features: {
            "Scripting Tool": 20,
            "Ideation Tool": 18,
            "YouTube Tools": 30,
            "Title Generator": 40,
            "Description Generator": 40,
            "Hashtag Generator": 50,
            "Keyword Ideas": 50,
            "Video Hook Generator": 40,
            "Title A/B Tester": 40,
            "Description Optimizer": 40,
            "Support": 1
          },
          is_active: true,
          description: 'Ideal for Serious Creators Looking for More Tools.'
        },
        {
          name: 'Pro',
          price: 29.99,
          features: {
            "Scripting Tool": -1,
            "Ideation Tool": -1,
            "YouTube Tools": -1,
            "Title Generator": -1,
            "Description Generator": -1,
            "Hashtag Generator": -1,
            "Keyword Ideas": -1,
            "Video Hook Generator": -1,
            "Title A/B Tester": -1,
            "Description Optimizer": -1,
            "Support": 2
          },
          is_active: true,
          description: 'Best for Professional Creators Needing Unlimited Access.'
        }
      ];

      // First try to update any existing plans by name - overwrite them
      const { data: existingPlans, error: fetchError } = await supabase
        .from('plans')
        .select('id, name');
      
      if (fetchError) {
        throw fetchError;
      }

      // Map existing plan names to their IDs
      const planMap: Record<string, string> = existingPlans.reduce((acc: Record<string, string>, plan) => {
        acc[plan.name] = plan.id;
        return acc;
      }, {});

      // Update existing plans first
      for (const plan of plans) {
        // If a plan with this name exists, update it
        if (planMap[plan.name]) {
          const { error } = await supabase
            .from('plans')
            .update({
              price: plan.price,
              features: plan.features,
              is_active: plan.is_active,
              description: plan.description
            })
            .eq('id', planMap[plan.name]);
          
          if (error) throw error;
          
          // Remove from our plans list so we don't create duplicates
          delete planMap[plan.name];
        } else {
          // Insert new plan
          const { error } = await supabase
            .from('plans')
            .insert([plan]);
          
          if (error) throw error;
        }
      }

      // Handle plans that weren't in our update list (rename them to avoid confusion)
      for (const [name, id] of Object.entries(planMap)) {
        const { error } = await supabase
          .from('plans')
          .update({ 
            name: `${name} (Legacy)`,
            is_active: false
          })
          .eq('id', id);
        
        if (error) throw error;
      }

      showToast('Plans updated successfully', 'success');
      fetchPlans();
    } catch (error) {
      console.error('Error updating plans:', error);
      showToast('Failed to update plans', 'error');
    }
  };

  // Add a button to force update plans
  const forceUpdatePlans = () => {
    addDefaultPlans();
  };

  // Check if plans need to be initialized
  useEffect(() => {
    if (!loading && plans.length === 0) {
      addDefaultPlans();
    }
  }, [loading, plans.length]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      // First get all plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (plansError) throw plansError;

      // Then get user counts for each plan
      const plansWithUserCounts = await Promise.all(
        plansData.map(async (plan) => {
          const { count, error } = await supabase
            .from('user_plans')
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', plan.id);
          
          return {
            ...plan,
            user_count: count || 0
          };
        })
      );

      setPlans(plansWithUserCounts);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showToast('Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PlanFormData, string>> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Plan name is required';
    }
    
    if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }
    
    try {
      JSON.parse(formData.features);
    } catch (e) {
      errors.features = 'Features must be valid JSON';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      features: '{}',
      is_active: true,
      description: ''
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setCurrentPlan(null);
    setModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setCurrentPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      features: JSON.stringify(plan.features, null, 2),
      is_active: plan.is_active,
      description: plan.description || ''
    });
    setModalOpen(true);
  };

  const openDeleteModal = (plan: Plan) => {
    setCurrentPlan(plan);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const parsedFeatures = JSON.parse(formData.features);
      
      if (currentPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('plans')
          .update({
            name: formData.name,
            price: formData.price,
            features: parsedFeatures,
            is_active: formData.is_active,
            description: formData.description
          })
          .eq('id', currentPlan.id);
        
        if (error) throw error;
        showToast('Plan updated successfully', 'success');
      } else {
        // Create new plan
        const { error } = await supabase
          .from('plans')
          .insert({
            name: formData.name,
            price: formData.price,
            features: parsedFeatures,
            is_active: formData.is_active,
            description: formData.description
          });
        
        if (error) throw error;
        showToast('Plan created successfully', 'success');
      }
      
      setModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      showToast('Failed to save plan', 'error');
    }
  };

  const handleDelete = async () => {
    if (!currentPlan) return;
    
    try {
      // Check if any users are on this plan
      if (currentPlan.user_count && currentPlan.user_count > 0) {
        showToast(`Cannot delete: ${currentPlan.user_count} users are on this plan`, 'error');
        setDeleteModalOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', currentPlan.id);
      
      if (error) throw error;
      
      showToast('Plan deleted successfully', 'success');
      setDeleteModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      showToast('Failed to delete plan', 'error');
    }
  };

  const togglePlanStatus = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);
      
      if (error) throw error;
      
      fetchPlans();
      showToast(`Plan ${plan.is_active ? 'disabled' : 'enabled'} successfully`, 'success');
    } catch (error) {
      console.error('Error toggling plan status:', error);
      showToast('Failed to update plan status', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 3000);
  };

  // Format features as a readable list
  const formatFeatures = (features: Record<string, number>) => {
    return Object.entries(features).map(([key, value]) => (
      <div key={key} className="flex justify-between items-center py-1.5 border-b border-[#1e293b] last:border-0">
        <span className="capitalize text-gray-300">{key}</span>
        <span className={`font-medium px-3 py-0.5 rounded-full text-sm ${
          value === -1 
            ? "bg-green-500/20 text-green-400" 
            : value === 0
              ? "bg-red-500/20 text-red-400"
              : "bg-blue-500/20 text-blue-400"
        }`}>
          {value === -1 
            ? "Unlimited" 
            : value === 0
              ? "None"
              : value}
        </span>
      </div>
    ));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plans Management</h1>
        <div className="flex gap-2">
          <button
            onClick={forceUpdatePlans}
            className="bg-[#2762EB] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#2762EB]/90 transition-colors"
          >
            Force Update Plans
          </button>
          <button
            onClick={openAddModal}
            className="bg-white text-[#020817] px-4 py-2 rounded-md flex items-center hover:bg-white/90 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add New Plan
          </button>
        </div>
      </div>
      
      <div className="card p-6">
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-t-[#2762EB] border-[#1E293B] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`card ${plan.is_active ? '' : 'opacity-70'} flex flex-col p-5`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-gray-400 mb-3">{plan.description}</p>
                    )}
                    <div className="flex items-center text-[#2762EB] font-bold">
                      <DollarSign size={20} className="mr-2" />
                      {plan.price === 0 ? (
                        <span className="text-xl">Free</span>
                      ) : (
                        <span className="text-xl">${plan.price.toFixed(2)}/month</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => togglePlanStatus(plan)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title={plan.is_active ? 'Disable Plan' : 'Enable Plan'}
                    >
                      {plan.is_active ? (
                        <ToggleRight size={20} className="text-green-500" />
                      ) : (
                        <ToggleLeft size={20} className="text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(plan)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex-1">
                  <div className="text-sm font-medium text-gray-300 mb-3">Features:</div>
                  <div className="space-y-2 bg-[#121826] p-4 rounded-md">
                    {Object.keys(plan.features).length > 0 ? (
                      formatFeatures(plan.features)
                    ) : (
                      <div className="text-sm text-gray-500">No features defined</div>
                    )}
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-[#2D3748]">
                  <div className="flex items-center text-sm text-gray-400">
                    <Package size={16} className="mr-2" />
                    <span>{plan.user_count} active users</span>
                  </div>
                </div>
              </div>
            ))}
            
            {plans.length === 0 && !loading && (
              <div className="col-span-3 py-8 text-center text-gray-400">
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No plans found</p>
                <p className="text-sm mt-2">Create your first plan by clicking "Add New Plan"</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Add/Edit Plan Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-[#121826] border border-[#2D3748] p-6 shadow-xl focus:outline-none overflow-auto">
            <Dialog.Title className="m-0 text-xl font-bold text-white">
              {currentPlan ? 'Edit Plan' : 'Create New Plan'}
            </Dialog.Title>
            
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g. Basic Plan, Pro Plan"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="e.g. Perfect for beginners"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-1">
                  Monthly Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Features (JSON format)
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Enter as {"{"}"feature": limit{"}"}. Example: {"{"}"ideas": 10, "seo": 5{"}"}. Use -1 for unlimited.
                </div>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  rows={5}
                  className="input w-full"
                  placeholder='{"Scripting Tool": 10, "Ideation Tool": -1}'
                />
                {formErrors.features && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.features}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 bg-[#1A2234] border border-[#2D3748] rounded text-[#2762EB] focus:ring-[#2762EB]"
                  />
                  <span className="ml-2 text-sm text-gray-400">
                    Plan is active and visible to users
                  </span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#1A2234] text-gray-300 rounded-md hover:bg-[#2D3748] focus:outline-none"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-[#020817] rounded-md hover:bg-white/90 focus:outline-none flex items-center"
                >
                  {currentPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-[#121826] border border-[#2D3748] p-6 shadow-xl focus:outline-none">
            <Dialog.Title className="m-0 text-xl font-bold text-white flex items-center">
              <Trash2 size={20} className="text-red-500 mr-2" />
              Delete Plan
            </Dialog.Title>
            
            <div className="mt-4">
              <p className="text-gray-300">
                Are you sure you want to delete the <span className="font-bold">{currentPlan?.name}</span> plan?
              </p>
              
              {currentPlan?.user_count && currentPlan.user_count > 0 ? (
                <div className="mt-3 bg-red-500/20 p-3 rounded-md text-sm text-red-300 border border-red-500/30">
                  <p className="font-medium">Warning: Cannot delete this plan</p>
                  <p className="mt-1">This plan has {currentPlan.user_count} active users. Remove all users from this plan before deleting.</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-400">
                  This action cannot be undone.
                </p>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#1A2234] text-gray-300 rounded-md hover:bg-[#2D3748] focus:outline-none"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none flex items-center"
                  disabled={Boolean(currentPlan?.user_count && currentPlan.user_count > 0)}
                >
                  <Trash2 size={16} className="mr-1" />
                  Delete Plan
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      {/* Toast Notification - Simple version without radix-ui/toast */}
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

export default PlansAdmin; 