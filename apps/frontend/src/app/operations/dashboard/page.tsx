'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { InlinePageLoading } from '@/components/layout/page-loading';
import { DashboardMetricCard } from '@/components/dashboard/dashboard-metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CreditCard, 
  FileText, 
  Building2, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

type OperationsDashboardData = {
  keyMetrics: {
    pendingDebitOrders: number;
    providerApplications: number;
    policiesInArrears: number;
    activeMembers: number;
    activeProviders: number;
    activeBrokers: number;
  };
  today: {
    memberQueries: number;
    claimsProcessed: number;
    brokerRequests: number;
    systemUptime: string;
  };
  performance: {
    debitOrderSuccessRate: string;
    openClaims: number;
    pendingApplications: number;
    activePaymentGroups: number;
    collectionValue: number;
    failedCollections: number;
    failedAmount: number;
  };
};

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('auth_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatCurrency = (value: number | string | null | undefined) =>
  `R${Number(value || 0).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function OperationsDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<OperationsDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadDashboard = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const response = await fetch('/api/operations/dashboard', {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load dashboard data');
        }

        if (!cancelled) setDashboardData(data);
      } catch (error: any) {
        if (!cancelled) setDashboardError(error.message || 'Failed to load dashboard data');
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (loading || dashboardLoading) {
    return (
      <SidebarLayout>
        <InlinePageLoading
          title="Operations Dashboard"
          description="Preparing your operational overview"
          message="Loading dashboard data..."
        />
      </SidebarLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const data = dashboardData;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}! Here's your operational overview</p>
        </div>

        {dashboardError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardMetricCard
            title="Pending Debit Orders"
            value={String(data?.keyMetrics.pendingDebitOrders || 0)}
            subtitle={`${formatCurrency(data?.performance.collectionValue)} current cycle`}
            icon={<CreditCard className="w-6 h-6 text-blue-600" />}
            accentColor="rgba(59, 130, 246, 1)"
            glowFrom="rgba(59, 130, 246, 0.075)"
            glowTo="rgba(59, 130, 246, 0.2)"
            onClick={() => router.push('/operations/debit-orders')}
            iconBackgroundClassName="bg-blue-100"
          />

          <DashboardMetricCard
            title="Provider Applications"
            value={String(data?.keyMetrics.providerApplications || 0)}
            subtitle="Pending approval"
            icon={<Building2 className="w-6 h-6 text-green-600" />}
            accentColor="rgba(16, 185, 129, 1)"
            glowFrom="rgba(16, 185, 129, 0.075)"
            glowTo="rgba(16, 185, 129, 0.2)"
            onClick={() => router.push('/operations/providers')}
            iconBackgroundClassName="bg-green-100"
            valueClassName="text-green-600"
          />

          <DashboardMetricCard
            title="Policies in Arrears"
            value={String(data?.keyMetrics.policiesInArrears || 0)}
            subtitle={`${formatCurrency(data?.performance.failedAmount)} unresolved`}
            icon={<AlertCircle className="w-6 h-6 text-red-600" />}
            accentColor="rgba(239, 68, 68, 1)"
            glowFrom="rgba(239, 68, 68, 0.075)"
            glowTo="rgba(239, 68, 68, 0.2)"
            onClick={() => router.push('/operations/arrears')}
            iconBackgroundClassName="bg-red-100"
            valueClassName="text-red-600"
          />
        </div>

        {/* Operational Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Member Queries</p>
                  <p className="text-3xl font-bold mt-1">{data?.today.memberQueries || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Logged today</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Claims Processed</p>
                  <p className="text-2xl font-bold mt-1">{data?.today.claimsProcessed || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Today</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Broker Requests</p>
                  <p className="text-2xl font-bold mt-1">{data?.today.brokerRequests || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">System Uptime</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{data?.today.systemUptime || '100%'}</p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/debit-orders')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Debit Orders</p>
                <p className="text-xs text-gray-500">Process payments</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/manage-groups')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Manage Groups</p>
                <p className="text-xs text-gray-500">Group operations</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/providers')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Providers</p>
                <p className="text-xs text-gray-500">Manage providers</p>
              </button>

              <button 
                className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
                onClick={() => router.push('/operations/reports')}
              >
                <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-2 transition-colors">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-medium">Reports</p>
                <p className="text-xs text-gray-500">Operational reports</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Collection Dates Calendar */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>📅 Group Debit Order Collection Calendar</CardTitle>
                <CardDescription>Scheduled collection dates for all Group Debit Order groups</CardDescription>
              </div>
              <Button onClick={() => router.push('/operations/collection-calendar')}>
                Manage Dates
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{data?.performance.activePaymentGroups || 0} active collection groups configured</p>
              <p className="text-xs mt-1">Collection dates are managed from the payment groups workspace</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/operations/collection-calendar')}
              >
                Set Up Collection Dates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest operational events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">Operational events will appear here as activity is logged</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500" />
                <p className="text-sm">All systems operational</p>
                <p className="text-xs mt-1">No alerts at this time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key operational metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Debit Order Success Rate</span>
                  <span className="font-medium">{data?.performance.debitOrderSuccessRate || '0%'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Open Claims</span>
                  <span className="font-medium">{data?.performance.openClaims || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Applications</span>
                  <span className="font-medium">{data?.performance.pendingApplications || 0}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed Collections</span>
                  <span className="font-medium">{data?.performance.failedCollections || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Collection Value</span>
                  <span className="font-medium">{formatCurrency(data?.performance.collectionValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Payment Groups</span>
                  <span className="font-medium">{data?.performance.activePaymentGroups || 0}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="font-medium">{data?.keyMetrics.activeMembers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Providers</span>
                  <span className="font-medium">{data?.keyMetrics.activeProviders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Brokers</span>
                  <span className="font-medium">{data?.keyMetrics.activeBrokers || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
