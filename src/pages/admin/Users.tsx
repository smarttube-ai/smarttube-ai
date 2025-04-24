import React, { useEffect, useState } from 'react';
import { supabase, adminSupabase } from '../../lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  UserCog,
  Clock,
  CreditCard,
  User2,
  ShieldCheck,
  ShieldX,
  MoreVertical,
  Trash2,
  Edit,
  Ban,
  CheckCircle,
  X
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at?: string;
  role?: string | null;
  is_admin: boolean;
  is_banned: boolean;
  plan_name: string | null;
  plan_status: string | null;
}

interface EditUserData {
  id: string;
  email: string;
  full_name: string | null;
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editUserData, setEditUserData] = useState<EditUserData>({ id: '', email: '', full_name: null });
  const usersPerPage = 12; // Updated to show 12 users per page

  const fetchUsers = async (page: number, query: string = '') => {
    setLoading(true);
    try {
      console.log('Fetching users for page:', page, 'with query:', query);
      
      // Calculate pagination
      const from = (page - 1) * usersPerPage;
      const to = from + usersPerPage - 1;

      console.log('Pagination range:', from, 'to', to);

      // Check if Supabase client is connected
      if (!supabase) {
        console.error('Supabase client is not initialized');
        throw new Error('Database connection not available');
      }

      // Use admin client if available for bypassing RLS
      const client = adminSupabase || supabase;
      console.log('Using client for fetching users:', adminSupabase ? 'admin (bypasses RLS)' : 'regular');
      
      try {
        // Build query
        let userQuery = client
          .from('profiles')
          .select('*', { count: 'exact' });
          
        // Apply search filter if query exists
        if (query) {
          userQuery = userQuery.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
        }
        
        // Apply pagination and order
        const { data, error, count } = await userQuery
          .order('created_at', { ascending: false })
          .range(from, to);

        console.log('Query response:', { data, error, count });

        if (error) {
          console.error('Supabase query error:', error);
          setUsers([]);
          setTotalUsers(0);
          setTotalPages(1);
          return;
        }

        if (!data || data.length === 0) {
          console.log('No users found. Try creating some test users.');
          setUsers([]);
          setTotalUsers(0);
          setTotalPages(1);
          return;
        }

        // Transform data with simple structure
        const transformedData = data.map(user => {
          // Handle the available fields safely - using existing columns
          return {
            id: user.id || '',
            email: user.email || '',
            full_name: user.full_name || null,
            avatar_url: user.avatar_url || null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: user.updated_at || undefined,
            role: user.role || undefined,
            // Use these properties if they exist, otherwise use role value or defaults
            is_admin: user.hasOwnProperty('is_admin') ? !!user.is_admin : (user.role === 'admin'),
            is_banned: user.hasOwnProperty('is_banned') ? !!user.is_banned : false,
            plan_name: 'Free',
            plan_status: 'none'
          };
        });

        console.log('Transformed data:', transformedData);
        setUsers(transformedData);
        setTotalUsers(count || 0);
        setTotalPages(Math.ceil((count || 0) / usersPerPage));
      } catch (queryError) {
        console.error('Error in query execution:', queryError);
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Ensure profiles table exists
  const ensureProfilesTable = async () => {
    try {
      console.log('Checking if profiles table exists...');
      
      // Try a more robust approach to check if the table exists
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_tables_info');
        
      if (tablesError) {
        console.error('Error getting tables info:', tablesError);
        
        // Fallback: Try a direct query to check existence
        try {
          console.log('Trying direct query approach...');
          const { data, error } = await supabase
            .from('profiles')
            .select('count(*)')
            .limit(1);
            
          if (error) {
            console.error('Error in direct query:', error);
            console.log('It appears the profiles table may not exist');
            
            // Alert with RLS guidance as well
            alert(
              'The profiles table either does not exist or has Row Level Security (RLS) issues.\n\n' +
              'Please check your Supabase setup and:\n' +
              '1. Make sure the profiles table exists\n' +
              '2. Add an INSERT policy with this SQL command:\n\n' +
              'CREATE POLICY "Allow all inserts to profiles"\n' +
              'ON profiles FOR INSERT\n' +
              'WITH CHECK (true);'
            );
            return false;
          }
          
          console.log('Table exists and is accessible');
          return true;
        } catch (innerError) {
          console.error('Error in fallback check:', innerError);
          return false;
        }
      }
      
      // Check if profiles table exists in the returned tables
      const profilesTable = Array.isArray(tablesData) && 
        tablesData.find(table => table.name === 'profiles');
        
      if (!profilesTable) {
        console.log('Profiles table not found in table list');
        alert(
          'The profiles table does not exist in your Supabase project.\n\n' +
          'Please create it using the SQL editor with this command:\n\n' +
          'CREATE TABLE IF NOT EXISTS profiles (\n' +
          '  id UUID PRIMARY KEY,\n' +
          '  email TEXT NOT NULL,\n' +
          '  full_name TEXT,\n' +
          '  avatar_url TEXT,\n' +
          '  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n' +
          '  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n' +
          '  role TEXT,\n' +
          '  is_admin BOOLEAN DEFAULT FALSE,\n' +
          '  is_banned BOOLEAN DEFAULT FALSE\n' +
          ');'
        );
        return false;
      }
      
      console.log('Profiles table exists');
      return true;
    } catch (error) {
      console.error('Error in ensureProfilesTable:', error);
      return false;
    }
  };

  const createTestUser = async () => {
    try {
      setLoading(true);
      
      // Log that we're checking profiles table
      console.log('Checking profiles table before creating test user');
      
      // Check Supabase connection first
      const { data: connectionTest, error: connectionError } = await supabase.from('_rpc').select('*').limit(1);
      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        alert('Cannot connect to Supabase. Please check your API keys and network connection.');
        setLoading(false);
        return;
      }
      
      // Generate a random email
      const randomId = Math.floor(Math.random() * 100000);
      const testEmail = `testuser${randomId}@example.com`;
      const fullName = `Test User ${randomId}`;
      
      // Create a UUID for the new user
      const userId = crypto.randomUUID();
      
      console.log(`Creating test user with ID: ${userId}`);
      
      // Try with admin client first if available (bypasses RLS)
      if (adminSupabase) {
        console.log('Using admin Supabase client to bypass RLS');
        const { error: adminError } = await adminSupabase
          .from('profiles')
          .insert({
            id: userId,
            email: testEmail,
            full_name: fullName,
            created_at: new Date().toISOString()
          });
          
        if (adminError) {
          console.error('Error creating test user with admin client:', adminError);
          // Fall back to regular client
          console.log('Falling back to regular client');
        } else {
          console.log('Test user created successfully with admin client');
          await fetchUsers(currentPage, searchQuery);
          alert(`Test user created with email: ${testEmail}`);
          setLoading(false);
          return;
        }
      }
      
      // If admin client not available or failed, try regular client
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: testEmail,
          full_name: fullName,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating test user:', error);
        
        if (error.message && error.message.toLowerCase().includes('violates row-level security policy')) {
          // RLS policy violation
          alert(
            'RLS Policy Violation: Cannot insert data due to Row Level Security.\n\n' +
            'Options to fix this:\n\n' +
            '1. Run this SQL to add an INSERT policy:\n' +
            'CREATE POLICY "Allow all inserts to profiles"\n' +
            'ON profiles FOR INSERT\n' +
            'WITH CHECK (true);\n\n' +
            '2. Run this SQL to disable RLS temporarily (dev only):\n' +
            'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;\n\n' +
            '3. Add a VITE_SUPABASE_SERVICE_KEY to your environment variables.'
          );
        } else if (error.message && error.message.includes('column')) {
          // Schema mismatch
          alert(`Schema error: ${error.message}\n\nMake sure your profiles table has the correct structure.`);
        } else {
          // Other error
          alert(`Failed to create test user: ${error.message}`);
        }
        return;
      }
      
      console.log('Test user created successfully');
      await fetchUsers(currentPage, searchQuery);
      alert(`Test user created with email: ${testEmail}`);
    } catch (error) {
      console.error('Error in createTestUser:', error);
      alert('Failed to create test user. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Create multiple test users in the profiles table
  const createTestData = async () => {
    try {
      const testCount = 5;
      console.log(`Creating ${testCount} test users`);
      
      for (let i = 0; i < testCount; i++) {
        const randomId = Math.floor(Math.random() * 100000);
        const testEmail = `testuser${randomId}@example.com`;
        const fullName = `Test User ${randomId}`;
        const userId = crypto.randomUUID();
        
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: testEmail,
            full_name: fullName,
            created_at: new Date().toISOString()
            // is_admin and is_banned will use default values from the table
          });
        
        if (error) {
          console.error(`Error creating test user ${i}:`, error);
          // Break on first error to avoid flooding console
          if (i === 0) break;
        } else {
          console.log(`Created test user ${i}`);
        }
      }
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  };

  const checkAndSetupProfilesTable = async () => {
    try {
      console.log('Checking profiles table');
      
      // Try a simple query to see if table exists
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error checking profiles table:', error);
        
        if (error.code === '42P01') {
          console.log('profiles table does not exist');
          await ensureProfilesTable();
        } else {
          console.log('Other error checking profiles table:', error.message);
        }
        return;
      }
      
      console.log('profiles table exists, checking for data');
      
      // If we got here, table exists, check if we have any data
      // Access count safely with optional chaining and default value
      const count = data && typeof data === 'object' ? (data as any).count || 0 : 0;
      
      if (count === 0) {
        console.log('No users found, creating test data');
        await createTestData();
      } else {
        console.log(`Found ${count} users`);
      }
    } catch (error) {
      console.error('Error in checkAndSetupProfilesTable:', error);
    }
  };

  const syncAuthUsers = async () => {
    try {
      setLoading(true);
      
      // Create multiple test users directly
      const testUserCount = 5;
      let successCount = 0;
      
      // Choose the appropriate client - admin client if available, otherwise regular
      const client = adminSupabase || supabase;
      const clientType = adminSupabase ? 'admin (bypasses RLS)' : 'regular';
      console.log(`Using ${clientType} Supabase client for user creation`);
      
      for (let i = 0; i < testUserCount; i++) {
        try {
          const randomId = Math.floor(Math.random() * 100000);
          const testEmail = `testuser${randomId}@example.com`;
          const fullName = `Test User ${randomId}`;
          const userId = crypto.randomUUID();
          
          const { error } = await client
            .from('profiles')
            .insert({
              id: userId,
              email: testEmail,
              full_name: fullName,
              created_at: new Date().toISOString(),
              is_admin: i === 0 // Make first user an admin
            });
          
          if (error) {
            console.error(`Error creating test user ${i}:`, error);
            
            if (i === 0 && error.message && error.message.toLowerCase().includes('violates row-level security policy')) {
              alert(
                'RLS Policy Violation: Cannot insert data due to Row Level Security.\n\n' +
                'Options to fix this:\n\n' +
                '1. Run this SQL to add an INSERT policy:\n' +
                'CREATE POLICY "Allow all inserts to profiles"\n' +
                'ON profiles FOR INSERT\n' +
                'WITH CHECK (true);\n\n' +
                '2. Run this SQL to disable RLS temporarily (dev only):\n' +
                'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;\n\n' +
                '3. Add a VITE_SUPABASE_SERVICE_KEY to your environment variables.'
              );
              break;
            }
          } else {
            successCount++;
            console.log(`Created test user ${i}`);
          }
        } catch (e) {
          console.error(`Error in test user creation loop iteration ${i}:`, e);
        }
      }
      
      if (successCount > 0) {
        alert(`Created ${successCount} test users successfully.`);
        await fetchUsers(currentPage, searchQuery);
      } else {
        alert('Failed to create any test users. Please check console for details.');
      }
    } catch (error) {
      console.error('Error in syncAuthUsers:', error);
      alert('Failed to sync users. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial setup and fetch
    console.log('Running useEffect for initialization');
    
    // Initial fetch
    fetchUsers(currentPage, searchQuery);
    
    // We can also add a subscription to users changes
    const subscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Profile change received:', payload);
        // Refresh data when changes occur
        fetchUsers(currentPage, searchQuery);
      })
      .subscribe();

    // Set up interval for periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing user data');
      fetchUsers(currentPage, searchQuery);
    }, 30000);

    return () => {
      // Clean up subscription and interval
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [currentPage, searchQuery]); // Re-run when page or search changes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchUsers(1, searchQuery);
  };

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentAdminStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error updating admin status:', error);
        alert(`Failed to update admin status: ${error.message}`);
        return;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_admin: !currentAdminStatus } 
          : user
      ));
    } catch (error) {
      console.error('Error updating admin status:', error);
      alert(`Failed to update admin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error updating ban status:', error);
        alert(`Failed to update ban status: ${error.message}`);
        return;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_banned: !currentBanStatus } 
          : user
      ));
    } catch (error) {
      console.error('Error updating ban status:', error);
      alert(`Failed to update ban status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) {
        console.error('Error deleting user:', error);
        alert(`Failed to delete user: ${error.message}`);
        return;
      }

      // Update local state
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setTotalUsers(prev => prev - 1);
      setShowDeleteDialog(false);
      
      // Recalculate total pages
      const newTotalPages = Math.ceil((totalUsers - 1) / usersPerPage);
      setTotalPages(newTotalPages);
      
      // If current page is greater than new total pages, go to last page
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages || 1);
      } else {
        // Refetch current page if it's the last page and there are no users left
        if (users.length === 1 && currentPage === totalPages) {
          fetchUsers(Math.max(currentPage - 1, 1));
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditUser = async () => {
    if (!editUserData.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: editUserData.email,
          full_name: editUserData.full_name
        })
        .eq('id', editUserData.id);

      if (error) {
        console.error('Error updating user:', error);
        alert(`Failed to update user: ${error.message}`);
        return;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === editUserData.id 
          ? { ...user, email: editUserData.email, full_name: editUserData.full_name } 
          : user
      ));
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openDeleteDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const openEditDialog = (user: UserProfile) => {
    setEditUserData({
      id: user.id,
      email: user.email,
      full_name: user.full_name
    });
    setShowEditDialog(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748]">
        <div className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full py-2 px-4 pl-10 bg-[#1A2234] border border-[#2D3748] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <button 
              type="submit"
              className="absolute right-3 top-2 bg-[#2762EB] text-white px-2 py-1 rounded text-xs"
            >
              Search
            </button>
          </form>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchUsers(currentPage, searchQuery);
                setLoading(true);
                setTimeout(() => setLoading(false), 800);
              }}
              className="p-2 bg-[#1A2234] rounded-md hover:bg-[#2D3748] transition-colors"
              title="Refresh data"
            >
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 11C20 15.4183 16.4183 19 12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3C15.0571 3 17.7192 4.7633 19 7.35024" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 3V7H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="text-sm text-gray-400">
              Total: <span className="font-medium text-white">{totalUsers}</span> users
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="w-10 h-10 border-4 border-t-[#2762EB] border-[#1E293B] rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#2D3748]">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3748]">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id} className={user.is_banned ? "opacity-70 bg-[#1A1A2A]" : "hover:bg-[#1A2234]"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-[#2762EB] flex items-center justify-center text-white font-semibold">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{user.full_name || 'N/A'}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.is_banned ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-900/30 text-red-500 flex items-center">
                                <Ban className="mr-1" size={12} />
                                Banned
                              </span>
                            ) : user.is_admin ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-500 flex items-center">
                                <UserCog className="mr-1" size={12} />
                                Admin
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-500 flex items-center">
                                <User2 className="mr-1" size={12} />
                                User
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="mr-1 text-gray-400" size={14} />
                            <span className="text-sm">
                              {user.plan_name || 'Free'}
                            </span>
                            {user.plan_status === 'active' && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-900/30 text-green-500">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="mr-1" size={14} />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="p-1 hover:bg-[#2D3748] rounded focus:outline-none">
                                <MoreVertical size={16} />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="min-w-[180px] bg-[#1A2234] rounded-lg p-1 shadow-lg border border-[#2D3748] animate-in slide-in-from-top-2 duration-200"
                                sideOffset={5}
                                align="end"
                              >
                                <DropdownMenu.Item
                                  className="flex items-center p-2 text-sm rounded hover:bg-[#2D3748] cursor-pointer text-white"
                                  onSelect={() => openEditDialog(user)}
                                >
                                  <Edit className="mr-2" size={14} />
                                  Edit User
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center p-2 text-sm rounded hover:bg-[#2D3748] cursor-pointer text-white"
                                  onSelect={() => handleToggleAdmin(user.id, user.is_admin)}
                                >
                                  {user.is_admin ? (
                                    <>
                                      <ShieldX className="mr-2" size={14} />
                                      Remove Admin
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="mr-2" size={14} />
                                      Make Admin
                                    </>
                                  )}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  className="flex items-center p-2 text-sm rounded hover:bg-[#2D3748] cursor-pointer text-white"
                                  onSelect={() => handleToggleBan(user.id, user.is_banned || false)}
                                >
                                  {user.is_banned ? (
                                    <>
                                      <CheckCircle className="mr-2" size={14} />
                                      Unban User
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="mr-2" size={14} />
                                      Ban User
                                    </>
                                  )}
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="h-px bg-[#2D3748] my-1" />
                                <DropdownMenu.Item
                                  className="flex items-center p-2 text-sm rounded hover:bg-red-900/30 cursor-pointer text-red-500"
                                  onSelect={() => openDeleteDialog(user)}
                                >
                                  <Trash2 className="mr-2" size={14} />
                                  Delete User
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="rounded-full bg-[#1A2234] p-4">
                            <User2 size={40} className="text-[#2762EB]" />
                          </div>
                          <div>
                            <p className="text-lg font-medium">No Users Found</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {searchQuery ? 'Try adjusting your search criteria' : 'There are no users in the system yet'}
                            </p>
                          </div>
                          {!searchQuery && (
                            <div className="flex flex-col gap-3 mt-4">
                              <button
                                onClick={createTestUser}
                                className="px-4 py-2 bg-[#2762EB] text-white rounded-md hover:bg-[#2762EB]/80 transition-colors"
                              >
                                Create Test User
                              </button>
                              <button
                                onClick={syncAuthUsers}
                                className="px-4 py-2 bg-[#121826] border border-[#2762EB] text-[#2762EB] rounded-md hover:bg-[#121826]/60 transition-colors"
                              >
                                Sync Auth Users
                              </button>
                              <button
                                onClick={() => {
                                  fetchUsers(currentPage, searchQuery);
                                  setLoading(true);
                                  setTimeout(() => setLoading(false), 1000);
                                }}
                                className="px-4 py-2 bg-[#121826] border border-[#2D3748] text-white rounded-md hover:bg-[#1A2234]/80 transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" stroke="currentColor" strokeWidth="1.5" />
                                  <path d="M16 12L12 12M12 12L8 12M12 12L12 8M12 12L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Refresh Data
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{users.length}</span> of{' '}
                <span className="font-medium text-white">{totalUsers}</span> users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? 'bg-[#1A2234] text-gray-500 cursor-not-allowed'
                      : 'bg-[#1A2234] text-white hover:bg-[#2D3748]'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-400">
                  Page <span className="font-medium text-white">{currentPage}</span> of{' '}
                  <span className="font-medium text-white">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-[#1A2234] text-gray-500 cursor-not-allowed'
                      : 'bg-[#1A2234] text-white hover:bg-[#2D3748]'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete User Dialog */}
      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#121826] border border-[#2D3748] rounded-lg shadow-lg p-6 w-[90vw] max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">Delete User</Dialog.Title>
            <Dialog.Description className="text-gray-400 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
              {selectedUser && (
                <div className="mt-4 p-3 bg-[#1A2234] rounded-lg">
                  <div className="font-semibold">{selectedUser.full_name || 'N/A'}</div>
                  <div className="text-sm text-gray-400">{selectedUser.email}</div>
                </div>
              )}
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-[#1A2234] text-white rounded-md hover:bg-[#2D3748]"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDeleteUser}
              >
                Delete
              </button>
            </div>
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#2D3748]">
                <X size={18} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit User Dialog */}
      <Dialog.Root open={showEditDialog} onOpenChange={setShowEditDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#121826] border border-[#2D3748] rounded-lg shadow-lg p-6 w-[90vw] max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">Edit User</Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input 
                  type="email" 
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                  className="w-full bg-[#1A2234] border border-[#2D3748] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editUserData.full_name || ''}
                  onChange={(e) => setEditUserData({...editUserData, full_name: e.target.value || null})}
                  className="w-full bg-[#1A2234] border border-[#2D3748] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#2762EB] focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 bg-[#1A2234] text-white rounded-md hover:bg-[#2D3748]"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#2762EB] text-white rounded-md hover:bg-[#2762EB]/80"
                onClick={handleEditUser}
              >
                Save Changes
              </button>
            </div>
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#2D3748]">
                <X size={18} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default UsersAdmin; 