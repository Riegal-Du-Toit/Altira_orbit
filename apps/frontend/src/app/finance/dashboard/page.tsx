'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { InlinePageLoading } from '@/components/layout/page-loading';
import { DashboardMetricCard } from '@/components/dashboard/dashboard-metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, FileText } from 'lucide-react';

export default function FinanceDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <SidebarLayout>
        <InlinePageLoading
          title="Finance Dashboard"
          description="Preparing your financial overview"
          message="Loading finance workspace..."
        />
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}! Here's your financial overview</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardMetricCard
            title="Total Revenue"
            value="R 0"
            subtitle="No revenue yet"
            icon={<DollarSign className="w-6 h-6 text-cyan-600" />}
            accentColor="rgba(34, 211, 238, 1)"
            glowFrom="rgba(34, 211, 238, 0.075)"
            glowTo="rgba(34, 211, 238, 0.2)"
            iconBackgroundClassName="bg-cyan-100"
          />

          <DashboardMetricCard
            title="Outstanding Payments"
            value="R 0"
            subtitle="0 pending"
            icon={<CreditCard className="w-6 h-6 text-green-600" />}
            accentColor="rgba(16, 185, 129, 1)"
            glowFrom="rgba(16, 185, 129, 0.075)"
            glowTo="rgba(16, 185, 129, 0.2)"
            iconBackgroundClassName="bg-green-100"
          />

          <DashboardMetricCard
            title="Reconciliation Status"
            value="100%"
            subtitle="Up to date"
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            accentColor="rgba(59, 130, 246, 1)"
            glowFrom="rgba(59, 130, 246, 0.075)"
            glowTo="rgba(59, 130, 246, 0.2)"
            valueClassName="text-blue-600"
            iconBackgroundClassName="bg-blue-100"
          />

          <DashboardMetricCard
            title="Journal Entries"
            value="0"
            subtitle="This month"
            icon={<FileText className="w-6 h-6 text-purple-600" />}
            accentColor="rgba(147, 51, 234, 1)"
            glowFrom="rgba(147, 51, 234, 0.075)"
            glowTo="rgba(147, 51, 234, 0.2)"
            iconBackgroundClassName="bg-purple-100"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group"
                onClick={() => router.push('/finance/ledger')}
              >
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">View Ledger</p>
                <p className="text-xs text-gray-500">General ledger</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group"
                onClick={() => router.push('/finance/reconciliation')}
              >
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <DollarSign className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">Reconciliation</p>
                <p className="text-xs text-gray-500">Bank reconciliation</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group"
                onClick={() => router.push('/finance/payment-batches')}
              >
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <CreditCard className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">Payments</p>
                <p className="text-xs text-gray-500">Process payments</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-cyan-50 hover:border-cyan-300 transition-colors text-left group"
                onClick={() => router.push('/finance/reports')}
              >
                <div className="w-10 h-10 bg-cyan-100 group-hover:bg-cyan-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="font-medium">Trial Balance</p>
                <p className="text-xs text-gray-500">View reports</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
