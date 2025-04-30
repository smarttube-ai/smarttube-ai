import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, AlertTriangle, Bell, InfoIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  expiry_date: string;
  created_at: string;
}

const AnnouncementDialog: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDialogAnnouncements = async () => {
      try {
        // Use the custom function we created in the migration specifically for dialog announcements
        const { data, error } = await supabase.rpc('get_dialog_announcements');
        
        if (error) throw error;
        
        // Check local storage for previously dismissed announcements
        const storedDismissed = localStorage.getItem('dismissed_dialog_announcements');
        const dismissedAnnouncements = storedDismissed ? JSON.parse(storedDismissed) : {};
        
        // Filter out any announcements that the user has dismissed
        const filteredAnnouncements = data.filter(
          (announcement: Announcement) => !dismissedAnnouncements[announcement.id]
        );
        
        setAnnouncements(filteredAnnouncements);
        setDismissed(dismissedAnnouncements);
        
        // Open the dialog if there are any announcements to show
        if (filteredAnnouncements.length > 0) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching dialog announcements:', error);
      }
    };

    fetchDialogAnnouncements();
  }, []);

  const dismissAnnouncement = (id: string) => {
    const updatedDismissed = { ...dismissed, [id]: true };
    setDismissed(updatedDismissed);
    localStorage.setItem('dismissed_dialog_announcements', JSON.stringify(updatedDismissed));
    
    // Remove from the current announcements array
    const updatedAnnouncements = announcements.filter(a => a.id !== id);
    setAnnouncements(updatedAnnouncements);
    
    // Close the dialog if there are no more announcements
    if (updatedAnnouncements.length === 0) {
      setIsOpen(false);
    } else {
      // Move to the next announcement or wrap to the first
      setCurrentIndex(prevIndex => 
        prevIndex >= updatedAnnouncements.length - 1 ? 0 : prevIndex
      );
    }
  };

  const handleNext = () => {
    setCurrentIndex(prevIndex => 
      prevIndex >= announcements.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentIndex(prevIndex => 
      prevIndex <= 0 ? announcements.length - 1 : prevIndex - 1
    );
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-6 h-6" />;
      case 'medium':
        return <Bell className="w-6 h-6" />;
      case 'low':
      default:
        return <InfoIcon className="w-6 h-6" />;
    }
  };
  
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-950/30';
      case 'medium':
        return 'text-amber-500 bg-amber-950/30';
      case 'low':
      default:
        return 'text-blue-500 bg-blue-950/30';
    }
  };

  // Don't render anything if there are no announcements or the dialog is closed
  if (announcements.length === 0 || !isOpen) return null;
  
  const currentAnnouncement = announcements[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop - clicking this closes the dialog */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDialog}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          {/* Dialog content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2 }}
            className="relative bg-[#121826] border border-[#2D3748] rounded-lg shadow-xl max-w-md w-full z-10 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with priority indicator */}
            <div className={`px-6 py-4 border-b border-[#2D3748] flex items-center ${getPriorityStyles(currentAnnouncement.priority)}`}>
              <div className="mr-3">
                {getPriorityIcon(currentAnnouncement.priority)}
              </div>
              <div className="flex-1 pr-6">
                <h3 className="font-semibold text-lg">{currentAnnouncement.title}</h3>
              </div>
              <button 
                onClick={closeDialog}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-gray-300">{currentAnnouncement.message}</p>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#2D3748] flex justify-between items-center">
              {/* Page indicator */}
              {announcements.length > 1 && (
                <div className="flex items-center space-x-1">
                  {announcements.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentIndex ? 'bg-blue-500' : 'bg-[#2D3748]'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-gray-400">
                    {currentIndex + 1}/{announcements.length}
                  </span>
                </div>
              )}
              
              <div className="flex space-x-2">
                {announcements.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="px-3 py-1.5 text-sm border border-[#2D3748] rounded hover:bg-[#2D3748] transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-3 py-1.5 text-sm border border-[#2D3748] rounded hover:bg-[#2D3748] transition-colors"
                    >
                      Next
                    </button>
                  </>
                )}
                <button
                  onClick={() => dismissAnnouncement(currentAnnouncement.id)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementDialog; 