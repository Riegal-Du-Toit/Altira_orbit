import { NextRequest, NextResponse } from 'next/server';
import { requireAnyRole } from '@/lib/auth-server';
import { buildCollectionSummary, fetchCollectionMembers, netcashSupabase } from '@/lib/netcash-operations';

export const dynamic = 'force-dynamic';

const OPERATIONS_ROLES = ['operations_manager', 'finance_manager', 'admin', 'system_admin'];

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function countRows(
  table: string,
  applyFilters?: (query: any) => any
) {
  let query = netcashSupabase.from(table).select('id', { count: 'exact', head: true });
  if (applyFilters) query = applyFilters(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, OPERATIONS_ROLES);

    const { start, end } = todayRange();
    const members = await fetchCollectionMembers();
    const collectionSummary = buildCollectionSummary(members);

    const [
      activeMembers,
      providerApplications,
      activeProviders,
      activeBrokers,
      claimsProcessedToday,
      memberQueriesToday,
      brokerRequestsPending,
      openClaims,
      pendingApplications,
      activePaymentGroups,
    ] = await Promise.all([
      countRows('members', (query) => query.eq('status', 'active')),
      countRows('providers', (query) => query.or('status.eq.pending,is_active.eq.false')),
      countRows('providers', (query) => query.or('status.eq.active,is_active.eq.true')),
      countRows('brokers', (query) => query.eq('status', 'active')),
      countRows('claims', (query) => query.gte('created_at', start).lt('created_at', end)),
      countRows('contact_interactions', (query) => query.gte('created_at', start).lt('created_at', end)),
      countRows('contact_interactions', (query) =>
        query
          .or('subject.ilike.%broker%,message.ilike.%broker%,outcome.ilike.%broker%')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ),
      countRows('claims', (query) => query.in('status', ['pending', 'processing', 'pended', 'review'])),
      countRows('applications', (query) => query.in('status', ['submitted', 'pending', 'in_review'])),
      countRows('payment_groups', (query) => query.eq('status', 'active')),
    ]);

    const policiesInArrears = members.filter(
      (member) =>
        Number(member.total_arrears || 0) > 0 ||
        ['rejected', 'overdue', 'arrears'].includes(String(member.payment_status || '').toLowerCase()) ||
        String(member.debit_order_status || '').toLowerCase() === 'failed'
    ).length;

    const pendingDebitOrders = members.filter((member) =>
      ['individual_debit_order', 'group_debit_order', 'eft'].includes(String(member.collection_method || '').toLowerCase())
    ).length;

    const debitOrderSuccessRate = collectionSummary.totalMembers
      ? `${collectionSummary.collectionRate}%`
      : '0%';

    return NextResponse.json({
      keyMetrics: {
        pendingDebitOrders,
        providerApplications,
        policiesInArrears,
        activeMembers,
        activeProviders,
        activeBrokers,
      },
      today: {
        memberQueries: memberQueriesToday,
        claimsProcessed: claimsProcessedToday,
        brokerRequests: brokerRequestsPending,
        systemUptime: '100%',
      },
      performance: {
        debitOrderSuccessRate,
        openClaims,
        pendingApplications,
        activePaymentGroups,
        collectionValue: collectionSummary.totalAmount,
        failedCollections: collectionSummary.failedCount,
        failedAmount: collectionSummary.failedAmount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching operations dashboard:', error);
    const message = error?.message || 'Failed to load operations dashboard';
    const status = message.includes('Access denied') ? 403 : message.includes('token') || message.includes('Authentication') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
