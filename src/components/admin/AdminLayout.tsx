import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  CreditCard,
  Bell,
  ChevronFirst,
  ChevronLast,
  User,
  LogOut,
  Home,
  Gauge,
  ShieldCheck,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function AdminLayout() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Package, label: 'Plans', path: '/admin/plans' },
    { icon: Gauge, label: 'Feature Limits', path: '/admin/limits' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  // Update page title based on route
  useEffect(() => {
    const currentRoute = menuItems.find(item => location.pathname === item.path);
    if (currentRoute) {
      setPageTitle(currentRoute.label);
    }
    
    // Handle responsive sidebar
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const handleSignOut = () => {
    signOut();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the user's profile data
      await refreshProfile();
      
      // Refresh the current page by forcing a navigation to the same route
      const currentPath = location.pathname;
      navigate('/', { replace: true });
      setTimeout(() => {
        navigate(currentPath, { replace: true });
      }, 100);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
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
            onClick={() => navigate('/admin/dashboard')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <motion.span 
                className="ml-3 text-xl font-bold font-montserrat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Admin Panel
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

          {/* Back to App */}
          <div className="mt-6 mb-4 px-3">
            <Link
              to="/"
              className={`flex items-center rounded-lg py-2 px-3 text-sm transition-all ${
                sidebarOpen ? 'justify-start' : 'justify-center'
              } text-gray-400 hover:text-white hover:bg-white/5`}
            >
              <ArrowLeft className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Back to App</span>}
            </Link>
          </div>

          {/* Menu Items */}
          <div className="mt-2 px-2 space-y-0.5">
            {menuItems.map((item) => (
              <motion.div key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? "bg-white/10 text-white font-medium"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* User Profile at Bottom */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 ${sidebarOpen ? 'flex flex-col' : 'flex justify-center'}`}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button 
                  className={`flex items-center rounded-lg p-2 hover:bg-accent transition-colors ${
                    sidebarOpen ? 'justify-between w-full' : 'justify-center'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="ml-3 text-left overflow-hidden"
                      >
                        <div className="text-sm font-medium truncate">{profile?.full_name || 'Admin'}</div>
                        <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                      </motion.div>
                    )}
                  </div>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[220px] bg-card rounded-lg p-2 shadow-lg border border-border animate-in slide-in-from-top-2 duration-200"
                  sideOffset={5}
                  align="end"
                >
                  <div className="px-2 py-1.5 mb-2">
                    <div className="font-medium">{profile?.full_name || 'Admin'}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                    <div className="mt-1 text-xs bg-gradient-to-r from-[#2762EB] to-[#9333EA] text-white px-1.5 py-0.5 rounded inline-flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Admin
                    </div>
                  </div>

                  <DropdownMenu.Separator className="h-px bg-border my-2" />

                  <DropdownMenu.Item
                    className="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-accent cursor-default"
                    asChild
                  >
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2 text-[#2762EB]" />
                      Main Dashboard
                    </Link>
                  </DropdownMenu.Item>

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
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        {/* Top Navigation */}
        <header className="h-16 border-b border-border bg-card sticky top-0 z-20">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            <div className="flex items-center gap-2">
              {/* Gradient Circle with Icon */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2762EB] to-[#9333EA] flex items-center justify-center">
                {(() => {
                  const currentItem = menuItems.find(item => location.pathname === item.path);
                  if (currentItem) {
                    const Icon = currentItem.icon;
                    return <Icon className="w-4 h-4 text-white" />;
                  }
                  return <LayoutDashboard className="w-4 h-4 text-white" />;
                })()}
              </div>
              <motion.h1 
                className="text-xl font-semibold"
                layout
              >
                {pageTitle}
              </motion.h1>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-full hover:bg-accent transition-colors flex items-center justify-center"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
} 