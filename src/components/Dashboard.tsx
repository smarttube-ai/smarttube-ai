import React, { useState, Suspense } from 'react';
import {
  LayoutDashboard,
  FileText,
  Youtube,
  Target,
  Search,
  BarChart2,
  Settings,
  HelpCircle,
  ChevronDown,
  User,
  LogOut,
  Lightbulb,
  ArrowRight,
  Sparkles,
  FileEdit,
  ChevronLast,
  ChevronFirst,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { scrollToHero } from '../utils/scroll';
import YouTubeTools from './YouTubeTools';
import ScriptingSection from './ScriptingSection';
import IdeationSection from './IdeationSection';
import AiSeoTools from './AiSeoTools';
import SettingsPage from './SettingsPage';
import SupportPage from './SupportPage';
import ChannelGoals from './ChannelGoals';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface Activity {
  id: string;
  type: 'video' | 'idea' | 'script';
  description: string;
  timestamp: Date;
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [ideaInput, setIdeaInput] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addActivity = (type: Activity['type'], description: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date(),
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 5)); // Keep only last 5 activities
  };

  const handleSignOut = () => {
    signOut();
  };

  const handleYouTubeAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl) {
      addActivity('video', 'Video Analysis Started');
      setActiveSection('youtube-tools');
    }
  };

  const handleIdeaGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (ideaInput) {
      addActivity('idea', 'Content Idea Generated');
      setActiveSection('ideation');
    }
  };

  const handleScriptGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (scriptTitle) {
      addActivity('script', 'Script Generation Started');
      setActiveSection('scripting');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Target, label: 'Channel Goals', id: 'channel-goals' },
    { icon: FileText, label: 'Scripting', id: 'scripting' },
    { icon: Lightbulb, label: 'Ideation', id: 'ideation' },
    { icon: Youtube, label: 'YouTube Tools', id: 'youtube-tools' },
    { icon: Search, label: 'AI SEO Tools', id: 'ai-seo-tools' },
    { icon: Settings, label: 'Settings', id: 'settings' },
    { icon: HelpCircle, label: 'Support', id: 'support' },
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'video':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'idea':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'script':
        return <FileText className="w-5 h-5 text-green-500" />;
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'channel-goals':
        return <ChannelGoals />;
      case 'ideation':
        return <IdeationSection />;
      case 'scripting':
        return <ScriptingSection />;
      case 'youtube-tools':
        return <YouTubeTools />;
      case 'ai-seo-tools':
        return <AiSeoTools />;
      case 'settings':
        return <SettingsPage />;
      case 'support':
        return <SupportPage />;
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h1 className="text-3xl font-bold mb-3">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-lg opacity-90">
                Ready to create amazing content? Your AI-powered content creation assistant is here to help you succeed on YouTube.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* YouTube Analysis Tool */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Youtube className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Video Analysis</h2>
                </div>
                <form onSubmit={handleYouTubeAnalyze} className="space-y-4">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Enter YouTube video URL"
                    className="input w-full"
                  />
                  <button type="submit" className="button button-primary w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Analyze Video
                  </button>
                </form>
              </div>

              {/* Content Ideation Tool */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Content Ideas</h2>
                </div>
                <form onSubmit={handleIdeaGenerate} className="space-y-4">
                  <input
                    type="text"
                    value={ideaInput}
                    onChange={(e) => setIdeaInput(e.target.value)}
                    placeholder="Enter your channel niche or topic"
                    className="input w-full"
                  />
                  <button type="submit" className="button button-primary w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Ideas
                  </button>
                </form>
              </div>

              {/* Script Generator Tool */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <FileEdit className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Script Generator</h2>
                </div>
                <form onSubmit={handleScriptGenerate} className="space-y-4">
                  <input
                    type="text"
                    value={scriptTitle}
                    onChange={(e) => setScriptTitle(e.target.value)}
                    placeholder="Enter your video title"
                    className="input w-full"
                  />
                  <button type="submit" className="button button-primary w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Script
                  </button>
                </form>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <span>{activity.description}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No recent activity. Start creating content!
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Coming Soon</h2>
            <p className="text-muted-foreground mt-2">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.aside
          className={`fixed top-0 left-0 h-full bg-card border-r border-border z-30 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
          layout
        >
          {/* Logo */}
          <motion.div 
            className={`flex items-center ${sidebarOpen ? 'p-6' : 'p-4'} cursor-pointer`}
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                scrollToHero();
              }, 100);
            }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center flex-shrink-0">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <motion.span 
                className="ml-3 text-xl font-bold font-montserrat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                SmartTube AI
              </motion.span>
            )}
          </motion.div>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-4 top-7 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            {sidebarOpen ? (
              <ChevronFirst className="w-5 h-5" />
            ) : (
              <ChevronLast className="w-5 h-5" />
            )}
          </button>

          {/* Menu Items */}
          <div className="mt-2 px-3 space-y-1">
            {menuItems.map((item) => (
              <motion.a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(item.id);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
                className={`sidebar-menu group ${activeSection === item.id ? 'active' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.a>
            ))}
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        {/* Top Navigation */}
        <header className="h-16 border-b border-border bg-card sticky top-0 z-20">
          <div className="flex items-center h-full px-4 md:px-6">
            <div className="flex items-center space-x-3">
              {/* Gradient Circle with Icon */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                {(() => {
                  const currentItem = menuItems.find(item => item.id === activeSection);
                  if (currentItem) {
                    const Icon = currentItem.icon;
                    return <Icon className="w-4 h-4 text-white" />;
                  }
                  return null;
                })()}
              </div>
              <motion.h1 
                className="text-xl font-semibold"
                layout
              >
                {menuItems.find(item => item.id === activeSection)?.label}
              </motion.h1>
            </div>

            {/* User Menu */}
            <motion.div 
              className="ml-auto flex items-center space-x-4"
              layout
            >
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button 
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="hidden md:inline font-medium">{profile?.full_name || user?.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[220px] bg-card rounded-lg p-2 shadow-lg border border-border animate-in slide-in-from-top-2 duration-200"
                    sideOffset={5}
                    align="end"
                  >
                    <div className="px-2 py-1.5 mb-2">
                      <div className="font-medium">{profile?.full_name || 'User'}</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>

                    <DropdownMenu.Separator className="h-px bg-border my-2" />

                    <DropdownMenu.Item
                      className="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-accent cursor-default text-red-500"
                      onSelect={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </motion.div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <LoadingSpinner size="lg" />
                </div>
              }>
                {renderContent()}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}