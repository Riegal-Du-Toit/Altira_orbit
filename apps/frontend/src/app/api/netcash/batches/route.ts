import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/lib/auth-server'
import {
  buildCollectionSummary,
  fetchCollectionBatches,
  fetchCollectionMembers,
  formatDate,
  NETCASH_OPERATIONS_ROLES,
  nextBusinessDate,
} from '@/lib/netcash-operations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, NETCASH_OPERATIONS_ROLES)
    const members = await fetchCollectionMembers()
    const summary = buildCollectionSummary(members)
    const historyBatches = await fetchCollectionBatches()
    const actionDate = nextBusinessDate(2)
    const laterDate = new Date(actionDate)
    laterDate.setMonth(laterDate.getMonth() + 1)

    const batches = [
      {
        id: `collection-${formatDate(actionDate)}`,
        batch_number: `NC-${formatDate(actionDate).replace(/-/g, '')}-001`,
        action_date: formatDate(actionDate),
        total_members: summary.totalMembers,
        total_amount: summary.totalAmount,
        status: 'ready_for_submission',
        netcash_status: 'ready',
        created_at: new Date().toISOString(),
      },
      ...historyBatches,
      {
        id: `collection-${formatDate(laterDate)}`,
        batch_number: `NC-${formatDate(laterDate).replace(/-/g, '')}-001`,
        action_date: formatDate(laterDate),
        total_members: summary.totalMembers,
        total_amount: summary.totalAmount,
        status: 'scheduled',
        netcash_status: 'scheduled',
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ batches })
  } catch (error) {
    console.error('Error fetching Netcash batches:', error)
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
  }
}
