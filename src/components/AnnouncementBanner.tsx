import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MegaphoneIcon, X, AlertTriangle, Bell, InfoIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  announcement_type: 'bar' | 'dialog';
  expiry_date: string;
  created_at: string;
}

const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // Use the custom function we created in the migration that specifically gets bar announcements
        const { data, error } = await supabase.rpc('get_bar_announcements');
        
        if (error) throw error;
        
        // Check local storage for previously dismissed announcements
        const storedDismissed = localStorage.getItem('dismissed_bar_announcements');
        const dismissedAnnouncements = storedDismissed ? JSON.parse(storedDismissed) : {};
        
        // Filter out any announcements that the user has dismissed
        const filteredAnnouncements = data.filter(
          (announcement: Announcement) => !dismissedAnnouncements[announcement.id]
        );
        
        setAnnouncements(filteredAnnouncements);
        setDismissed(dismissedAnnouncements);
      } catch (error) {
        console.error('Error fetching bar announcements:', error);
      }
    };

    fetchAnnouncements();
    
    // Set up an interval to cycle through multiple announcements
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (announcements.length === 0) return 0;
        return (prev + 1) % announcements.length;
      });
    }, 8000); // Rotate every 8 seconds
    
    return () => clearInterval(interval);
  }, [announcements.length]);

  const dismissAnnouncement = (id: string) => {
    const updatedDismissed = { ...dismissed, [id]: true };
    setDismissed(updatedDismissed);
    localStorage.setItem('dismissed_bar_announcements', JSON.stringify(updatedDismissed));
    
    // Remove from the current announcements array
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      case 'medium':
        return <Bell className="w-5 h-5" />;
      case 'low':
      default:
        return <InfoIcon className="w-5 h-5" />;
    }
  };
  
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-gradient-to-r from-red-900/90 to-red-800/90 border-red-500/50';
      case 'medium':
        return 'bg-gradient-to-r from-amber-900/80 to-amber-800/80 border-amber-500/50';
      case 'low':
      default:
        return 'bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-blue-500/50';
    }
  };

  // Don't render anything if there are no announcements
  if (announcements.length === 0) return null;
  
  const currentAnnouncement = announcements[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 py-3 px-4 shadow-md border-b text-white ${getPriorityStyles(currentAnnouncement.priority)}`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-1.5 rounded-full flex-shrink-0">
              {getPriorityIcon(currentAnnouncement.priority)}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-sm md:text-base truncate max-w-[calc(100vw-120px)] md:max-w-[calc(100vw-180px)]">
                {currentAnnouncement.message}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            {announcements.length > 1 && (
              <div className="hidden md:flex items-center mr-4">
                <div className="flex space-x-1">
                  {announcements.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-xs opacity-80">
                  {currentIndex + 1}/{announcements.length}
                </span>
              </div>
            )}
            
            <button
              onClick={() => dismissAnnouncement(currentAnnouncement.id)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner; 