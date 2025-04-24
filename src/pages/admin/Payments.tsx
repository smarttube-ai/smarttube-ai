import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  CreditCard,
  Check,
  X,
  CircleSlash,
  Calendar,
  User,
  ExternalLink,
  Download,
  Filter
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

interface Payment {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'cancelled' | 'pending';
  provider: string;
  provider_id: string;
  created_at: string;
  plan_name: string;
}

// Define the type for the database response
interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'failed' | 'cancelled' | 'pending';
  provider: string;
  provider_id: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
  plans: {
    name: string;
  } | null;
}

const PaymentsAdmin: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<{ start?: string; end?: string }>({});
  const paymentsPerPage = 10;

  // Calculate the total revenue from successful payments
  const totalRevenue = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  useEffect(() => {
    fetchPayments(currentPage, searchQuery, statusFilter, dateFilter);
  }, [currentPage, statusFilter, dateFilter]);

  const fetchPayments = async (
    page: number, 
    query: string = '', 
    statuses: string[] = [],
    dates: { start?: string; end?: string } = {}
  ) => {
    setLoading(true);
    try {
      // Calculate pagination
      const from = (page - 1) * paymentsPerPage;
      const to = from + paymentsPerPage - 1;

      // Build query
      let paymentQuery = supabase
        .from('payments')
        .select(`
          id,
          user_id,
          amount,
          currency,
          status,
          provider,
          provider_id,
          created_at,
          profiles(email, full_name),
          plans(name)
        `, { count: 'exact' });

      // Apply search filter if query exists
      if (query) {
        paymentQuery = paymentQuery.or(`profiles.email.ilike.%${query}%,profiles.full_name.ilike.%${query}%,provider_id.ilike.%${query}%`);
      }

      // Apply status filter
      if (statuses.length > 0) {
        paymentQuery = paymentQuery.in('status', statuses);
      }

      // Apply date filter
      if (dates.start) {
        paymentQuery = paymentQuery.gte('created_at', dates.start);
      }
      if (dates.end) {
        paymentQuery = paymentQuery.lte('created_at', dates.end);
      }

      // Apply pagination and order
      const { data, error, count } = await paymentQuery
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data to include user info
      const transformedData = data?.map((payment: any) => ({
        id: payment.id,
        user_id: payment.user_id,
        user_email: Array.isArray(payment.profiles) 
          ? payment.profiles[0]?.email || 'Unknown' 
          : payment.profiles?.email || 'Unknown',
        user_name: Array.isArray(payment.profiles) 
          ? payment.profiles[0]?.full_name || null 
          : payment.profiles?.full_name || null,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        status: payment.status,
        provider: payment.provider,
        provider_id: payment.provider_id,
        created_at: payment.created_at,
        plan_name: Array.isArray(payment.plans) 
          ? payment.plans[0]?.name || 'Unknown Plan' 
          : payment.plans?.name || 'Unknown Plan'
      })) || [];

      setPayments(transformedData);
      setTotalPayments(count || 0);
      setTotalPages(Math.ceil((count || 0) / paymentsPerPage));
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchPayments(1, searchQuery, statusFilter, dateFilter);
  };

  const toggleStatusFilter = (status: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };

  const handleDateFilterChange = (field: 'start' | 'end', value: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    setDateFilter(prev => ({
      ...prev,
      [field]: value ? value : undefined
    }));
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setDateFilter({});
    setSearchQuery('');
    setCurrentPage(1);
    fetchPayments(1, '', [], {});
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100); // Assuming amount is in cents
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-500 flex items-center">
            <Check className="mr-1" size={12} />
            Paid
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-900/30 text-red-500 flex items-center">
            <X className="mr-1" size={12} />
            Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/30 text-yellow-500 flex items-center">
            <CircleSlash className="mr-1" size={12} />
            Cancelled
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-500 flex items-center">
            <CreditCard className="mr-1" size={12} />
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const exportCSV = () => {
    // Generate CSV content
    const headers = ['Date', 'User', 'Email', 'Plan', 'Amount', 'Status', 'Provider', 'Transaction ID'];
    const rows = payments.map(payment => [
      new Date(payment.created_at).toISOString().split('T')[0],
      payment.user_name || 'N/A',
      payment.user_email,
      payment.plan_name,
      formatAmount(payment.amount, payment.currency),
      payment.status,
      payment.provider,
      payment.provider_id
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payments-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payment Logs</h1>
        <button
          onClick={exportCSV}
          className="bg-white text-[#020817] px-4 py-2 rounded-md flex items-center hover:bg-white/90 transition-colors"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
          <div className="text-2xl font-bold">{formatAmount(totalRevenue, 'USD')}</div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-gray-400 text-sm mb-2">Successful Payments</h3>
          <div className="text-2xl font-bold">
            {payments.filter(p => p.status === 'paid').length} / {payments.length}
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-gray-400 text-sm mb-2">Failed Payments</h3>
          <div className="text-2xl font-bold">
            {payments.filter(p => p.status === 'failed').length}
          </div>
        </div>
      </div>
      
      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search by email, name or transaction ID..."
              className="input w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <button 
              type="submit"
              className="absolute right-3 top-2 bg-white text-[#020817] px-2 py-1 rounded text-xs hover:bg-white/90 transition-colors"
            >
              Search
            </button>
          </form>
          
          <div className="flex items-center space-x-2">
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 bg-[#1A2234] border border-[#2D3748] rounded-md text-sm hover:bg-[#2D3748] transition-colors">
                  <Filter size={16} />
                  Filters
                  {(statusFilter.length > 0 || dateFilter.start || dateFilter.end) && (
                    <span className="w-2 h-2 rounded-full bg-[#2762EB]"></span>
                  )}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="w-80 rounded-md bg-[#1A2234] shadow-md border border-[#2D3748] p-4"
                  sideOffset={5}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Payment Status</h3>
                      <div className="space-y-2">
                        {['paid', 'failed', 'cancelled', 'pending'].map((status) => (
                          <label key={status} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={statusFilter.includes(status)}
                              onChange={() => toggleStatusFilter(status)}
                              className="mr-2 h-4 w-4 rounded border-[#2D3748] text-[#2762EB] focus:ring-[#2762EB]"
                            />
                            <span className="capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Date Range</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">From</label>
                          <input
                            type="date"
                            value={dateFilter.start || ''}
                            onChange={(e) => handleDateFilterChange('start', e.target.value)}
                            className="w-full p-2 bg-[#121826] border border-[#2D3748] rounded-md text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">To</label>
                          <input
                            type="date"
                            value={dateFilter.end || ''}
                            onChange={(e) => handleDateFilterChange('end', e.target.value)}
                            className="w-full p-2 bg-[#121826] border border-[#2D3748] rounded-md text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={clearFilters}
                      className="w-full py-2 px-3 bg-[#2D3748] rounded-md text-sm hover:bg-[#374151] transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                  <Popover.Arrow className="fill-[#1A2234]" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            
            <div className="text-sm text-gray-400">
              Total: <span className="font-medium text-white">{totalPayments}</span> transactions
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3748]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#1A2234]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 text-gray-400" size={14} />
                          {formatDate(payment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-[#2762EB] flex items-center justify-center text-white font-semibold">
                              <User size={14} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{payment.user_name || 'N/A'}</div>
                            <div className="text-sm text-gray-400">{payment.user_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.plan_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400 font-mono">
                          {payment.provider_id.substring(0, 14)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm capitalize">{payment.provider}</span>
                          <a 
                            href={`https://dashboard.${payment.provider}.com/payments/${payment.provider_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-[#2762EB] hover:text-blue-400"
                            title="View in provider dashboard"
                          >
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                        No payment records found
                        {(statusFilter.length > 0 || dateFilter.start || dateFilter.end || searchQuery) && (
                          <div className="mt-2 text-sm">
                            Try adjusting your search or filters
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{payments.length}</span> of{' '}
                <span className="font-medium text-white">{totalPayments}</span> transactions
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
    </div>
  );
};

export default PaymentsAdmin; 