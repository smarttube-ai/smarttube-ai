import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MegaphoneIcon,
  Plus,
  Trash2, 
  Bell,
  AlertTriangle,
  ExternalLink,
  Pencil,
  Star
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Toast from '@radix-ui/react-toast';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  expiry_date: string;
  created_at: string;
  is_active: boolean;
}

interface AnnouncementFormData {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  expiry_date: string;
  is_active: boolean;
}

const AnnouncementsAdmin: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    message: '',
    priority: 'medium',
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AnnouncementFormData, string>>>({});
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showToast('Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AnnouncementFormData, string>> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    if (!formData.expiry_date) {
      errors.expiry_date = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiry_date);
      if (expiryDate < new Date()) {
        errors.expiry_date = 'Expiry date cannot be in the past';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      priority: 'medium',
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setCurrentAnnouncement(null);
    setModalOpen(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      expiry_date: new Date(announcement.expiry_date).toISOString().split('T')[0],
      is_active: announcement.is_active
    });
    setModalOpen(true);
  };

  const openDeleteModal = (announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (currentAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title: formData.title,
            message: formData.message,
            priority: formData.priority,
            expiry_date: formData.expiry_date,
            is_active: formData.is_active
          })
          .eq('id', currentAnnouncement.id);
        
        if (error) throw error;
        showToast('Announcement updated successfully', 'success');
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: formData.title,
            message: formData.message,
            priority: formData.priority,
            expiry_date: formData.expiry_date,
            is_active: formData.is_active
          });
        
        if (error) throw error;
        showToast('Announcement created successfully', 'success');
      }
      
      setModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      showToast('Failed to save announcement', 'error');
    }
  };

  const handleDelete = async () => {
    if (!currentAnnouncement) return;
    
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', currentAnnouncement.id);
      
      if (error) throw error;
      
      showToast('Announcement deleted successfully', 'success');
      setDeleteModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showToast('Failed to delete announcement', 'error');
    }
  };

  const toggleAnnouncementStatus = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !announcement.is_active })
        .eq('id', announcement.id);
      
      if (error) throw error;
      
      fetchAnnouncements();
      showToast(`Announcement ${announcement.is_active ? 'disabled' : 'enabled'} successfully`, 'success');
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      showToast('Failed to update announcement status', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast({ ...toast, open: false }), 3000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-900/30 text-red-500 flex items-center">
            <AlertTriangle className="mr-1" size={12} />
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-500 flex items-center">
            <Bell className="mr-1" size={12} />
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-500 flex items-center">
            <Star className="mr-1" size={12} />
            Low
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-900/30 text-gray-500">
            {priority}
          </span>
        );
    }
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const previewAnnouncement = (announcement: Announcement) => {
    // This could be implemented to show a preview of how the announcement will look to users
    // For now, we'll just show an explanation
    alert(`This announcement would appear as a popup or banner for users with title "${announcement.title}" and priority styling based on "${announcement.priority}".`);
  };

  return (
    <Toast.Provider>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Announcements</h1>
          <button
            onClick={openAddModal}
            className="bg-white text-[#020817] px-4 py-2 rounded-md flex items-center hover:bg-white/90 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Announcement
          </button>
        </div>
        
        <div className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748]">
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="w-10 h-10 border-4 border-t-[#2762EB] border-[#1E293B] rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <MegaphoneIcon size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Announcements</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first announcement to notify users about important updates.
                  </p>
                  <button
                    onClick={openAddModal}
                    className="bg-[#2762EB] text-white px-4 py-2 rounded-md flex items-center mx-auto"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Announcement
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => {
                    const expired = isExpired(announcement.expiry_date);
                    const active = announcement.is_active && !expired;
                    
                    return (
                      <div 
                        key={announcement.id}
                        className={`border rounded-lg p-5 ${
                          active 
                            ? 'border-[#2D3748] bg-[#1A2234]' 
                            : 'border-gray-700 bg-[#121826] opacity-70'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold">{announcement.title}</h3>
                              {getPriorityBadge(announcement.priority)}
                              {!active && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-800 text-gray-400">
                                  {expired ? 'Expired' : 'Inactive'}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                              Created: {formatDate(announcement.created_at)} • 
                              Expires: {formatDate(announcement.expiry_date)}
                            </p>
                            <p className="bg-[#121826] p-3 rounded-md text-sm">
                              {announcement.message}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => toggleAnnouncementStatus(announcement)}
                              className="p-2 text-gray-400 hover:text-white rounded-md"
                              title={announcement.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {announcement.is_active ? (
                                <Bell size={16} className="text-green-500" />
                              ) : (
                                <Bell size={16} className="text-gray-500" />
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(announcement)}
                              className="p-2 text-gray-400 hover:text-white rounded-md"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => previewAnnouncement(announcement)}
                              className="p-2 text-gray-400 hover:text-blue-500 rounded-md"
                              title="Preview"
                            >
                              <ExternalLink size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(announcement)}
                              className="p-2 text-gray-400 hover:text-red-500 rounded-md"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Add/Edit Announcement Modal */}
        <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-[#121826] border border-[#2D3748] p-6 shadow-xl focus:outline-none overflow-auto">
              <Dialog.Title className="m-0 text-xl font-bold text-white">
                {currentAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
              </Dialog.Title>
              
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                    placeholder="e.g. New Feature Released"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                    placeholder="Enter your announcement message here..."
                  />
                  {formErrors.message && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-white focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                    />
                    {formErrors.expiry_date && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.expiry_date}</p>
                    )}
                  </div>
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
                      Announcement is active and visible to users
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
                    className="px-4 py-2 bg-[#2762EB] text-white rounded-md hover:bg-blue-700 focus:outline-none flex items-center"
                  >
                    {currentAnnouncement ? 'Update Announcement' : 'Create Announcement'}
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
                Delete Announcement
              </Dialog.Title>
              
              <div className="mt-4">
                <p className="text-gray-300">
                  Are you sure you want to delete the announcement "<span className="font-bold">{currentAnnouncement?.title}</span>"?
                </p>
                
                <p className="mt-3 text-sm text-gray-400">
                  This action cannot be undone.
                </p>
                
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
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        
        {/* Toast Notification */}
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
      </div>
    </Toast.Provider>
  );
};

export default AnnouncementsAdmin; 