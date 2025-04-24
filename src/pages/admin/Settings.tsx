import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Save, 
  Loader2, 
  AlertTriangle, 
  Info,
  Settings as SettingsIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import * as Toast from '@radix-ui/react-toast';

interface AppSettings {
  maintenance_mode: boolean;
  banner_message: string;
  banner_enabled: boolean;
  support_email: string;
  max_upload_size: number;
  stripe_pk: string;
  stripe_sk: string;
}

const SettingsAdmin: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    maintenance_mode: false,
    banner_message: '',
    banner_enabled: false,
    support_email: '',
    max_upload_size: 5,
    stripe_pk: '',
    stripe_sk: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is returned when no rows are found
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setSettings(prev => ({ ...prev, [name]: checkbox.checked }));
    } else if (type === 'number') {
      setSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (setting: keyof AppSettings) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Check if settings record exists
      const { data: existingSettings, error: checkError } = await supabase
        .from('settings')
        .select('id', { count: 'exact', head: true });
      
      if (checkError) throw checkError;
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('settings')
          .update(settings)
          .eq('id', 1); // Assuming settings has a single row with id=1
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('settings')
          .insert({ ...settings, id: 1 });
        
        if (error) throw error;
      }
      
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast({ ...toast, open: false }), 3000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center my-12">
          <div className="w-10 h-10 border-4 border-t-[#2762EB] border-[#1E293B] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-[#2762EB] text-white px-4 py-2 rounded-md flex items-center"
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748]">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <SettingsIcon size={20} className="mr-2 text-[#2762EB]" />
              General Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1A2234] rounded-md">
                <div>
                  <h3 className="font-medium">Maintenance Mode</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    When enabled, users will see a maintenance page when visiting the app
                  </p>
                </div>
                <button 
                  onClick={() => handleToggle('maintenance_mode')}
                  className="text-2xl"
                >
                  {settings.maintenance_mode ? (
                    <ToggleRight size={28} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-500" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#1A2234] rounded-md">
                <div>
                  <h3 className="font-medium">Banner Message</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Show an announcement banner at the top of the app
                  </p>
                </div>
                <button 
                  onClick={() => handleToggle('banner_enabled')}
                  className="text-2xl"
                >
                  {settings.banner_enabled ? (
                    <ToggleRight size={28} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-500" />
                  )}
                </button>
              </div>
              
              {settings.banner_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Banner Text
                  </label>
                  <textarea
                    name="banner_message"
                    value={settings.banner_message}
                    onChange={handleChange}
                    rows={2}
                    className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                    placeholder="Enter your announcement message here..."
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  name="support_email"
                  value={settings.support_email}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                  placeholder="support@yourdomain.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Max Upload Size (MB)
                </label>
                <input
                  type="number"
                  name="max_upload_size"
                  value={settings.max_upload_size}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Payment Settings */}
          <div className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748]">
            <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Stripe Public Key
                </label>
                <input
                  type="text"
                  name="stripe_pk"
                  value={settings.stripe_pk}
                  onChange={handleChange}
                  className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                  placeholder="pk_test_..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Stripe Secret Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="stripe_sk"
                    value={settings.stripe_sk}
                    onChange={handleChange}
                    className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                    placeholder="sk_test_..."
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <AlertTriangle size={16} className="text-yellow-500" />
                  </div>
                </div>
                <p className="text-xs text-yellow-500 mt-1">
                  Secret keys should be stored securely. Consider using environment variables instead.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Help Section */}
        <div>
          <div className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748]">
            <h2 className="text-xl font-semibold mb-4">Settings Help</h2>
            
            <div className="space-y-6">
              <div className="bg-[#1A2234] p-4 rounded-md">
                <h3 className="font-medium mb-2 text-[#2762EB]">Maintenance Mode</h3>
                <p className="text-sm text-gray-400">
                  When enabled, all non-admin users will see a maintenance page.
                  Use this when performing major updates.
                </p>
              </div>
              
              <div className="bg-[#1A2234] p-4 rounded-md">
                <h3 className="font-medium mb-2 text-[#2762EB]">Banner Message</h3>
                <p className="text-sm text-gray-400">
                  The banner will appear at the top of all pages in the app.
                  Use it for important announcements or new feature alerts.
                </p>
              </div>
              
              <div className="bg-[#1A2234] p-4 rounded-md">
                <h3 className="font-medium mb-2 text-[#2762EB]">Stripe Integration</h3>
                <p className="text-sm text-gray-400">
                  Enter your Stripe API keys to enable payment processing.
                  You can find these in your Stripe dashboard.
                </p>
              </div>
              
              <div className="flex items-start mt-6">
                <Info size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-400">
                  All settings are applied immediately after saving. Some changes may require users to refresh their browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <Toast.Provider>
        <Toast.Root
          open={toast.open}
          onOpenChange={(open) => setToast({ ...toast, open })}
          className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${
            toast.type === 'success' ? 'bg-green-800' : 'bg-red-800'
          } text-white max-w-sm z-50`}
        >
          <Toast.Title className="font-medium">
            {toast.type === 'success' ? 'Success' : 'Error'}
          </Toast.Title>
          <Toast.Description className="mt-1 text-sm">
            {toast.message}
          </Toast.Description>
        </Toast.Root>
        <Toast.Viewport />
      </Toast.Provider>
    </div>
  );
};

export default SettingsAdmin; 