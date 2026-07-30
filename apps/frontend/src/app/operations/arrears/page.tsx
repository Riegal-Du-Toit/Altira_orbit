'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Banknote, Building2, CheckCircle2, PhoneCall, Search } from 'lucide-react';
import { SidebarLayout } from '@/components/layout/sidebar-layout';
import { authFetch } from '@/lib/auth-fetch';

type ArrearsCase = {
  id: string;
  memberId: string;
  memberNumber: string;
  memberName: string;
  email: string | null;
  phone: string | null;
  brokerName: string;
  planName: string;
  collectionMethod: string;
  collectionMethodLabel: string;
  groupName: string | null;
  monthlyPremium: number;
  arrearsAmount: number;
  failedCount: number;
  ageDays: number;
  risk: 'low' | 'medium' | 'high';
  owner: string;
  status: string;
  reason: string;
  lastAttemptDate: string | null;
  nextAction: string;
};

type ArrearsPayload = {
  summary: {
    totalCases: number;
    totalArrears: number;
    highRiskCases: number;
    failedCollections: number;
    eftFollowUps: number;
    averageAgeDays: number;
  };
  byMethod: Record<string, { count: number; amount: number }>;
  byOwner: Record<string, { count: number; amount: number }>;
  byBroker: Record<string, { count: number; amount: number }>;
  cases: ArrearsCase[];
};

const formatCurrency = (value: number | string | null | undefined) =>
  `R${Number(value || 0).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const riskClass = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-emerald-100 text-emerald-800',
};

const methodClass: Record<string, string> = {
  'Individual Debit Order': 'bg-blue-100 text-blue-800',
  'Group Debit Order': 'bg-purple-100 text-purple-800',
  EFT: 'bg-orange-100 text-orange-800',
};

export default function ArrearsManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<ArrearsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    fetchArrears();
  }, []);

  const fetchArrears = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authFetch('/api/operations/arrears');
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load arrears data');
      }

      setData(payload);
    } catch (err) {
      console.error('Error fetching arrears:', err);
      setError(err instanceof Error ? err.message : 'Failed to load arrears data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return (data?.cases || []).filter((item) => {
      const haystack = [
        item.memberName,
        item.memberNumber,
        item.email,
        item.phone,
        item.brokerName,
        item.planName,
        item.reason,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!query || haystack.includes(query)) &&
        (methodFilter === 'all' || item.collectionMethodLabel === methodFilter) &&
        (ownerFilter === 'all' || item.owner === ownerFilter) &&
        (riskFilter === 'all' || item.risk === riskFilter)
      );
    });
  }, [data, searchTerm, methodFilter, ownerFilter, riskFilter]);

  const methodOptions = Object.keys(data?.byMethod || {});
  const ownerOptions = Object.keys(data?.byOwner || {});

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arrears Management</h1>
          <p className="mt-2 text-gray-600">
            Live recovery queue for failed collections, unpaid EFTs, and member payment exceptions.
          </p>
        </div>

        {loading ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-gray-600">Loading arrears data...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <MetricCard label="Open Cases" value={String(data?.summary.totalCases || 0)} icon={<AlertTriangle size={22} />} tone="blue" />
              <MetricCard label="Arrears Value" value={formatCurrency(data?.summary.totalArrears)} icon={<Banknote size={22} />} tone="red" />
              <MetricCard label="High Risk" value={String(data?.summary.highRiskCases || 0)} icon={<AlertTriangle size={22} />} tone="red" />
              <MetricCard label="Failed Collections" value={String(data?.summary.failedCollections || 0)} icon={<Building2 size={22} />} tone="purple" />
              <MetricCard label="EFT Follow-ups" value={String(data?.summary.eftFollowUps || 0)} icon={<CheckCircle2 size={22} />} tone="orange" />
              <MetricCard label="Average Age" value={`${data?.summary.averageAgeDays || 0} days`} icon={<PhoneCall size={22} />} tone="green" />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <BreakdownCard title="Collection Method Exposure" rows={data?.byMethod || {}} />
              <BreakdownCard title="Department Queue" rows={data?.byOwner || {}} />
              <BreakdownCard title="Broker / Group Exposure" rows={data?.byBroker || {}} />
            </div>

            <div className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recovery Worklist</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Cases are prioritised by arrears value, failed attempts, and age.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  <label className="relative">
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search member..."
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>
                  <select
                    value={methodFilter}
                    onChange={(event) => setMethodFilter(event.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All methods</option>
                    {methodOptions.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                  <select
                    value={ownerFilter}
                    onChange={(event) => setOwnerFilter(event.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All departments</option>
                    {ownerOptions.map((owner) => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                  <select
                    value={riskFilter}
                    onChange={(event) => setRiskFilter(event.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="all">All risk</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredCases.length === 0 ? (
              <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
                <p className="text-gray-500">No arrears cases match the selected filters.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Member</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Method</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Department</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Age</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reason</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredCases.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => router.push(`/operations/members/${item.memberId}`)}
                              className="text-left"
                            >
                              <p className="font-semibold text-gray-900">{item.memberName}</p>
                              <p className="text-xs text-gray-500">{item.memberNumber} - {item.phone || item.email || 'No contact'}</p>
                              <p className="text-xs text-gray-500">{item.brokerName} / {item.planName}</p>
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${methodClass[item.collectionMethodLabel] || 'bg-slate-100 text-slate-700'}`}>
                              {item.collectionMethodLabel}
                            </span>
                            {item.groupName && <p className="mt-1 text-xs text-gray-500">{item.groupName}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">{item.owner}</p>
                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${riskClass[item.risk]}`}>
                              {item.risk} risk
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">{formatCurrency(item.arrearsAmount)}</p>
                            <p className="text-xs text-gray-500">Premium {formatCurrency(item.monthlyPremium)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">{item.ageDays} days</p>
                            <p className="text-xs text-gray-500">{item.failedCount} failed attempts</p>
                          </td>
                          <td className="max-w-xs px-5 py-4 text-sm text-gray-600">{item.reason}</td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700">{item.nextAction}</p>
                            <button
                              type="button"
                              onClick={() => router.push(`/operations/members/${item.memberId}`)}
                              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
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
          </>
        )}
      </div>
    </SidebarLayout>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}) {
  const classes = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${classes[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-md bg-white/70 p-2">{icon}</div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: Record<string, { count: number; amount: number }> }) {
  const sortedRows = Object.entries(rows).sort((a, b) => b[1].amount - a[1].amount);

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {sortedRows.length === 0 ? (
          <p className="text-sm text-gray-500">No exposure found.</p>
        ) : (
          sortedRows.slice(0, 5).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-3 py-2">
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{value.count} cases</p>
              </div>
              <p className="font-semibold text-gray-900">{formatCurrency(value.amount)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
