import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Save,
  AlertTriangle,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: profile.email || '',
      }));
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update password if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword,
        });

        if (passwordError) throw passwordError;
      }

      setSuccess(true);
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation === 'DELETE') {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user?.id);
        
        if (error) throw error;

        // Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(
          user?.id as string
        );

        if (authError) throw authError;

        // Sign out
        await supabase.auth.signOut();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete account');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center py-8">
      <div className="w-full max-w-2xl mx-auto px-6">
        <div className="space-y-6">
          {success && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-4 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <p>Settings updated successfully!</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="border border-[#1F2937] rounded-lg p-6 space-y-6">
            <div>
              <label className="block text-sm mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full h-12 bg-[#0A0A0A] rounded-md pl-11 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full h-12 bg-[#0A0A0A] rounded-md pl-11 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] opacity-50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-base font-medium mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-[#0A0A0A] rounded-md pl-11 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-12 bg-[#0A0A0A] rounded-md pl-11 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="button" 
                onClick={handleSave}
                className="w-full h-12 bg-white text-black rounded-md font-medium flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-500 rounded-lg p-6">
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Danger Zone</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <button
                  className="w-full h-12 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors"
                >
                  Delete Account
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1F2937] rounded-lg p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-xl font-semibold">
                      Delete Account
                    </Dialog.Title>
                    <Dialog.Close className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="text-gray-400 mb-4">
                    This action cannot be undone. This will permanently delete your account and remove all associated data.
                  </Dialog.Description>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">
                        Type "DELETE" to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className="w-full h-12 bg-[#0A0A0A] rounded-md px-4 text-sm border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                        placeholder='Type "DELETE"'
                      />
                    </div>
                    <div className="flex gap-3">
                      <Dialog.Close asChild>
                        <button className="flex-1 h-12 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition-colors">
                          Cancel
                        </button>
                      </Dialog.Close>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== 'DELETE' || loading}
                        className="flex-1 h-12 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                        ) : (
                          'Delete Account'
                        )}
                      </button>
                    </div>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </div>
    </div>
  );
}