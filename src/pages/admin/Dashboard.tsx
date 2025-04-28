import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  Package,
  ExternalLink,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock3,
  User2
} from 'lucide-react';

interface StatsCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  avgDailyActiveUsers: number;
  totalPlans: number;
  activePlans: number;
  totalPayments: number;
  successfulPayments: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface RecentUser {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  is_admin: boolean;
  is_banned: boolean;
}

interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'cancelled' | 'pending';
  user_email: string;
  user_name: string | null;
  plan_name: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    avgDailyActiveUsers: 0,
    totalPlans: 0,
    activePlans: 0,
    totalPayments: 0,
    successfulPayments: 0,
    userGrowth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Get current date and 30 days ago for monthly comparisons
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);
        
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
        const sixtyDaysAgoStr = sixtyDaysAgo.toISOString();
        
        // Fetch all the stats in parallel for better performance
        const [
          usersResult,
          recentUsersResult,
          plansResult
        ] = await Promise.all([
          // Total users count
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          
          // Recent users - fetch the 8 most recent users
          supabase.from('profiles')
            .select('id, full_name, email, avatar_url, created_at, is_admin, is_banned')
            .order('created_at', { ascending: false })
            .limit(8),
            
          // Plans data
          supabase.from('plans').select('*'),
          
        ]);
        
        // Handle errors or missing tables gracefully
        if (usersResult.error) console.error('Error fetching users count:', usersResult.error);
        if (recentUsersResult.error) console.error('Error fetching recent users:', recentUsersResult.error);
        if (plansResult.error) console.error('Error fetching plans:', plansResult.error);
        
        // Fetch users from this month and last month for growth calculation
        const usersThisMonthResult = await supabase.from('profiles')
          .select('id')
          .gte('created_at', thirtyDaysAgoStr);
          
        const usersLastMonthResult = await supabase.from('profiles')
          .select('id')
          .gte('created_at', sixtyDaysAgoStr)
          .lt('created_at', thirtyDaysAgoStr);
        
        // Calculate growth rates
        const userGrowth = calculateGrowthRate(
          usersLastMonthResult.data?.length || 0,
          usersThisMonthResult.data?.length || 0
        );
        
        // Placeholder data for subscriptions and payments until those are implemented
        const activePlans = plansResult.data?.filter(p => p.is_active).length || 0;
        
        // Set final stats with available data, use placeholders for missing data
        setStats({
          totalUsers: usersResult.count || 0,
          activeSubscriptions: 0, // Placeholder
          monthlyRevenue: 0, // Placeholder
          avgDailyActiveUsers: Math.round((usersResult.count || 0) * 0.3), // Estimate
          totalPlans: plansResult.data?.length || 0,
          activePlans: activePlans,
          totalPayments: 0, // Placeholder
          successfulPayments: 0, // Placeholder
          userGrowth: userGrowth,
          revenueGrowth: 0 // Placeholder
        });
        
        // Set recent users
        setRecentUsers(recentUsersResult.data || []);
        
        // Placeholder for recent payments
        setRecentPayments([]);
        
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Helper function to calculate growth rate
  const calculateGrowthRate = (previous: number, current: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100); // Assuming amount is in cents
  };
  
  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Helper function for payment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-500 flex items-center">
            <CheckCircle className="mr-1" size={12} />
            Paid
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-900/30 text-red-500 flex items-center">
            <XCircle className="mr-1" size={12} />
            Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-500 flex items-center">
            <AlertCircle className="mr-1" size={12} />
            Cancelled
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-500 flex items-center">
            <Clock3 className="mr-1" size={12} />
            Pending
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-900/30 text-gray-500 flex items-center">
            {status}
          </span>
        );
    }
  };

  const primaryStatsCards: StatsCard[] = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: stats.userGrowth,
      icon: <Users size={20} />,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      change: 0, // Would need historical data to calculate
      icon: <CreditCard size={20} />,
      color: 'bg-green-500',
      link: '/admin/plans'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      change: stats.revenueGrowth,
      icon: <Activity size={20} />,
      color: 'bg-purple-500',
      link: '/admin/payments'
    },
    {
      title: 'Daily Active Users',
      value: stats.avgDailyActiveUsers,
      change: 0, // Would need historical data to calculate
      icon: <Clock size={20} />,
      color: 'bg-amber-500',
      link: '/admin/users'
    },
  ];
  
  const secondaryStatsCards: StatsCard[] = [
    {
      title: 'Total Plans',
      value: stats.totalPlans,
      icon: <Package size={20} />,
      color: 'bg-indigo-500',
      link: '/admin/plans'
    },
    {
      title: 'Active Plans',
      value: stats.activePlans,
      icon: <CheckCircle size={20} />,
      color: 'bg-teal-500',
      link: '/admin/plans'
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: <CreditCard size={20} />,
      color: 'bg-rose-500',
      link: '/admin/payments'
    },
    {
      title: 'Payment Success Rate',
      value: stats.totalPayments ? `${Math.round((stats.successfulPayments / stats.totalPayments) * 100)}%` : '0%',
      icon: <BarChart3 size={20} />,
      color: 'bg-cyan-500',
      link: '/admin/payments'
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="w-10 h-10 border-4 border-t-[#2762EB] border-[#1E293B] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Primary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {primaryStatsCards.map((card, index) => (
              <Link
                to={card.link}
                key={index}
                className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748] hover:border-[#2762EB]/60 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">{card.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                  </div>
                  <div className={`p-2 rounded-md ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                {card.change !== undefined && (
                  <div className="flex items-center text-sm">
                    {card.change >= 0 ? (
                      <>
                        <ArrowUpRight size={16} className="text-green-500 mr-1" />
                        <span className="text-green-500">{card.change}% </span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight size={16} className="text-red-500 mr-1" />
                        <span className="text-red-500">{Math.abs(card.change)}% </span>
                      </>
                    )}
                    <span className="text-gray-400 ml-1">vs last month</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
          
          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {secondaryStatsCards.map((card, index) => (
              <Link
                to={card.link}
                key={index}
                className="bg-[#121826] rounded-lg p-5 shadow-md border border-[#2D3748] hover:border-[#2762EB]/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">{card.title}</p>
                    <h3 className="text-xl font-bold">{card.value}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Users */}
            <div className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Users</h2>
                <Link to="/admin/users" className="text-[#2762EB] text-sm flex items-center hover:underline">
                  View All Users <ExternalLink size={14} className="ml-1" />
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#2D3748]">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D3748]">
                    {recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#1A2234]">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                {user.avatar_url ? (
                                  <img className="h-8 w-8 rounded-full" src={user.avatar_url} alt="" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-[#2762EB] flex items-center justify-center text-white font-semibold">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(user.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="rounded-full bg-[#1A2234] p-4">
                              <User2 size={32} className="text-[#2762EB]" />
                            </div>
                            <div>
                              <p className="text-md font-medium">No Users Found</p>
                              <p className="text-sm text-gray-400 mt-1">
                                There are no users in the system yet
                              </p>
                            </div>
                            <Link 
                              to="/admin/users" 
                              className="mt-2 px-4 py-2 bg-[#2762EB] text-white rounded-md text-sm hover:bg-[#2762EB]/80 transition-colors"
                            >
                              Go to User Management
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {recentUsers.length > 0 && (
                <div className="mt-4 text-center">
                  <Link 
                    to="/admin/users" 
                    className="inline-flex items-center justify-center px-4 py-2 bg-[#1A2234] hover:bg-[#2D3748] rounded-md transition-colors text-sm"
                  >
                    View All Users <ExternalLink size={14} className="ml-2" />
                  </Link>
                </div>
              )}
            </div>
            
            {/* Recent Payments */}
            <div className="bg-[#121826] rounded-lg p-6 shadow-md border border-[#2D3748]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Payments</h2>
                <Link to="/admin/payments" className="text-[#2762EB] text-sm flex items-center">
                  View All <ExternalLink size={14} className="ml-1" />
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#2D3748]">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D3748]">
                    {recentPayments.length > 0 ? (
                      recentPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-[#1A2234]">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{payment.user_name || 'N/A'}</div>
                            <div className="text-xs text-gray-400">{payment.user_email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {formatCurrency(payment.amount, payment.currency)}
                            </div>
                            <div className="text-xs text-gray-400">{payment.plan_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(payment.created_at)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 