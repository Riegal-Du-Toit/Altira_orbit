'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarLayout } from '@/components/layout/sidebar-layout';

type TabType = 'overview' | 'groups' | 'members' | 'transactions' | 'failed-payments' | 'refunds' | 'reconciliation' | 'webhooks' | 'reports' | 'batches' | 'today';

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('auth_access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const formatCurrency = (value: number | string | null | undefined) =>
  `R${Number(value || 0).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export default function DebitOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [todayBatches, setTodayBatches] = useState<any[]>([]);
  const [todayTransactions, setTodayTransactions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [failedPayments, setFailedPayments] = useState<any[]>([]);
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'individual' | 'group' | 'eft'>('all');

  useEffect(() => {
    fetchSummary();
    if (activeTab === 'batches') {
      fetchBatches();
    } else if (activeTab === 'today') {
      fetchTodayBatches();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'failed-payments') {
      fetchFailedPayments();
    }
  }, [activeTab]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/netcash/batches', { headers: getAuthHeaders() });
      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayBatches = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/netcash/today?strike_date=${today}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setTodayTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching today transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/netcash/transactions', { headers: getAuthHeaders() });
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFailedPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/netcash/failed-payments', { headers: getAuthHeaders() });
      const data = await response.json();
      setFailedPayments(data.failedPayments || []);
    } catch (error) {
      console.error('Error fetching failed payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/netcash/summary', { headers: getAuthHeaders() });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching Netcash summary:', error);
    }
  };

  const filteredTodayTransactions = todayTransactions.filter(
    (t) =>
      collectionFilter === 'all' ||
      t.collection_method ===
        (collectionFilter === 'individual'
          ? 'individual_debit_order'
          : collectionFilter === 'group'
            ? 'group_debit_order'
            : collectionFilter)
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debit Order Management</h1>
          <p className="text-gray-600 mt-2">Monthly Netcash collection operations, reconciliation, and reporting</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-1 min-w-max">
            {[
              { id: 'today', label: "Today's Batches", icon: '📅' },
              { id: 'batches', label: 'All Batches', icon: '📋' },
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'groups', label: 'Groups', icon: '👥' },
              { id: 'members', label: 'Members', icon: '👤' },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'failed-payments', label: 'Failed', icon: '⚠️' },
              { id: 'refunds', label: 'Refunds', icon: '💸' },
              { id: 'reconciliation', label: 'Reconcile', icon: '🔄' },
              { id: 'webhooks', label: 'Webhooks', icon: '📡' },
              { id: 'reports', label: 'Reports', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs transition-colors flex items-center gap-1
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'today' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Today's Debit Order Transactions</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Strike Date: {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Loaded 3 days ago for processing)
                  </p>
                </div>
                <button
                  onClick={() => router.push('/operations/debit-orders/run')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <span>🚀</span>
                  <span>Run New Batch</span>
                </button>
              </div>

              {summary && (
                <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase text-slate-500">Monthly Portfolio</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{summary.totalMembers || 0}</p>
                    <p className="text-xs text-slate-500">active debit/EFT records</p>
                  </div>
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-medium uppercase text-emerald-700">Collection Value</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-700">{formatCurrency(summary.totalAmount)}</p>
                    <p className="text-xs text-emerald-700">current collection cycle</p>
                  </div>
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-medium uppercase text-blue-700">Collection Rate</p>
                    <p className="mt-2 text-2xl font-bold text-blue-700">{summary.collectionRate || 0}%</p>
                    <p className="text-xs text-blue-700">collection outcome</p>
                  </div>
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
                    <p className="text-xs font-medium uppercase text-rose-700">Exception Queue</p>
                    <p className="mt-2 text-2xl font-bold text-rose-700">{summary.failedCount || 0}</p>
                    <p className="text-xs text-rose-700">{formatCurrency(summary.failedAmount)} unresolved</p>
                  </div>
                </div>
              )}

              {/* Filter Buttons */}
              <div className="mb-6 flex gap-2">
                <button
                  onClick={() => setCollectionFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({todayTransactions.length})
                </button>
                <button
                  onClick={() => setCollectionFilter('individual')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Individual Debit Orders ({todayTransactions.filter(t => t.collection_method === 'individual_debit_order').length})
                </button>
                <button
                  onClick={() => setCollectionFilter('group')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'group'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Group Debit Orders ({todayTransactions.filter(t => t.collection_method === 'group_debit_order').length})
                </button>
                <button
                  onClick={() => setCollectionFilter('eft')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    collectionFilter === 'eft'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  EFT Payments ({todayTransactions.filter(t => t.collection_method === 'eft').length})
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : todayTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-lg mb-2 font-medium">No transactions scheduled for today</p>
                  <p className="text-sm">Transactions are loaded 3 days before the strike date</p>
                </div>
              ) : (
                <div>
                  {/* Summary Stats */}
                  <div className="mb-6 grid grid-cols-5 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Total Transactions</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {filteredTodayTransactions.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(filteredTodayTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0))}
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-xs text-gray-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {filteredTodayTransactions.filter(t => t.status === 'pending').length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Successful</p>
                      <p className="text-2xl font-bold text-green-600">
                        {filteredTodayTransactions.filter(t => t.status === 'successful').length}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-xs text-gray-600 mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {filteredTodayTransactions.filter(t => t.status === 'failed').length}
                      </p>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collection Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTodayTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.member_name || `${transaction.first_name} ${transaction.last_name}`}
                              </div>
                              <div className="text-xs text-gray-500">{transaction.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.member_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.collection_method === 'individual_debit_order' ? 'bg-blue-100 text-blue-800' :
                                transaction.collection_method === 'group_debit_order' ? 'bg-purple-100 text-purple-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {transaction.collection_method === 'individual_debit_order' ? 'Individual' :
                                 transaction.collection_method === 'group_debit_order' ? 'Group' : 'EFT'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {transaction.group_name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.bank_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                transaction.status === 'successful' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                                transaction.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => router.push(`/operations/members/${transaction.member_id}`)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View Member
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'batches' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Debit Order Batches</h2>
                <button
                  onClick={() => router.push('/operations/debit-orders/run')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  🚀 Run New Batch
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : batches.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg mb-2">No batches yet</p>
                  <p className="text-sm">Click "Run New Batch" to create your first debit order batch</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {batches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {batch.batch_number || batch.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(batch.action_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.total_members}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(batch.total_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              batch.status === 'completed' || batch.status === 'reconciled' ? 'bg-green-100 text-green-800' :
                              batch.status === 'failed' ? 'bg-red-100 text-red-800' :
                              batch.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {String(batch.status).replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(batch.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">All Transactions</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.members?.first_name} {tx.members?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.bank_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tx.status === 'successful' ? 'bg-green-100 text-green-800' :
                              tx.status === 'failed' ? 'bg-red-100 text-red-800' :
                              tx.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'failed-payments' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Failed Payments</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : failedPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No failed payments</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {failedPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.members?.first_name} {payment.members?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.members?.phone || payment.members?.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {payment.failure_reason || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Monthly Collection Control</h2>
                <p className="mt-1 text-sm text-gray-600">A full-cycle view of how Netcash collections are prepared, submitted, monitored, and reconciled.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[
                  ['Load collections', 'Members are grouped by debit day, broker, and method.'],
                  ['Generate batch', 'The batch is prepared for Netcash file/API submission.'],
                  ['Monitor results', 'Successful, processing, and failed collections are tracked.'],
                  ['Reconcile', 'Expected and received values are checked for discrepancies.'],
                ].map(([title, description], index) => (
                  <div key={title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-cyan-50 text-sm font-bold text-cyan-700">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
              {summary && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900">Current Collection Cycle</h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div><p className="text-xs text-slate-500">Members</p><p className="text-xl font-bold">{summary.totalMembers}</p></div>
                    <div><p className="text-xs text-slate-500">Expected</p><p className="text-xl font-bold">{formatCurrency(summary.totalAmount)}</p></div>
                    <div><p className="text-xs text-slate-500">Pending</p><p className="text-xl font-bold">{summary.pendingCount}</p></div>
                    <div><p className="text-xs text-slate-500">Successful</p><p className="text-xl font-bold">{summary.successfulCount}</p></div>
                    <div><p className="text-xs text-slate-500">Exceptions</p><p className="text-xl font-bold">{summary.failedCount}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Collection Groups</h2>
              <p className="mb-6 text-sm text-gray-600">Broker and group-level monthly debit order exposure for the active portfolio.</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {Object.entries(summary?.byBroker || {}).map(([broker, data]: [string, any]) => (
                  <div key={broker} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{broker}</h3>
                        <p className="text-sm text-slate-500">Monthly collection group</p>
                      </div>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">Ready</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-slate-500">Members</p><p className="text-lg font-bold">{data.count}</p></div>
                      <div><p className="text-slate-500">Premium</p><p className="text-lg font-bold">{formatCurrency(data.premium)}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Collection Members</h2>
              <p className="mb-6 text-sm text-gray-600">Active members grouped into the monthly collection cycle.</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {Object.entries(summary?.byMethod || {}).map(([method, data]: [string, any]) => (
                  <div key={method} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{method.replace(/_/g, ' ')}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{data.count}</p>
                    <p className="text-sm text-slate-600">{formatCurrency(data.premium)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'refunds' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Refunds & Reversals</h2>
              <p className="mb-6 text-sm text-gray-600">Queue for reversals, duplicate collections, and cancelled-member refunds.</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-4"><p className="text-sm text-slate-500">Pending review</p><p className="text-2xl font-bold">2</p></div>
                <div className="rounded-md border border-slate-200 p-4"><p className="text-sm text-slate-500">Ready to process</p><p className="text-2xl font-bold">1</p></div>
                <div className="rounded-md border border-slate-200 p-4"><p className="text-sm text-slate-500">Month-to-date value</p><p className="text-2xl font-bold">{formatCurrency(780)}</p></div>
              </div>
            </div>
          )}

          {activeTab === 'reconciliation' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Reconciliation</h2>
              <p className="mb-6 text-sm text-gray-600">Expected collection value compared with Netcash settlement results.</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-md border border-slate-200 p-4"><p className="text-sm text-slate-500">Expected</p><p className="text-2xl font-bold">{formatCurrency(summary?.totalAmount)}</p></div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm text-emerald-700">Matched</p><p className="text-2xl font-bold text-emerald-700">{formatCurrency((summary?.totalAmount || 0) - (summary?.failedAmount || 0))}</p></div>
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4"><p className="text-sm text-rose-700">Discrepancies</p><p className="text-2xl font-bold text-rose-700">{formatCurrency(summary?.failedAmount)}</p></div>
                <div className="rounded-md border border-blue-200 bg-blue-50 p-4"><p className="text-sm text-blue-700">Status</p><p className="text-2xl font-bold text-blue-700">Review</p></div>
              </div>
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Webhook Monitor</h2>
              <p className="mb-6 text-sm text-gray-600">Netcash callback monitoring for collection status updates and exceptions.</p>
              <div className="space-y-3">
                {[
                  ['batch_completed', 'Received after Netcash completes the batch.', 'Waiting'],
                  ['payment_success', 'Updates member payment history and reconciliation.', 'Active'],
                  ['payment_failed', 'Creates exception follow-up for Operations.', 'Active'],
                  ['refund_processed', 'Confirms refund or reversal completion.', 'Configured'],
                ].map(([event, description, status]) => (
                  <div key={event} className="flex items-center justify-between rounded-md border border-slate-200 p-4">
                    <div><p className="font-semibold text-slate-900">{event}</p><p className="text-sm text-slate-600">{description}</p></div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Monthly Reports</h2>
              <p className="mb-6 text-sm text-gray-600">Reporting pack for collection performance, broker exposure, failed payments, and reconciliation.</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ['Collection Summary', `${summary?.totalMembers || 0} members, ${formatCurrency(summary?.totalAmount)} expected`],
                  ['Exception Report', `${summary?.failedCount || 0} failed/rejected payments requiring follow-up`],
                  ['Broker Exposure', `${Object.keys(summary?.byBroker || {}).length} broker/direct groups in cycle`],
                  ['Reconciliation Pack', `${summary?.collectionRate || 0}% collection rate`],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
