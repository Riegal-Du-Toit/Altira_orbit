import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/lib/auth-server'
import { brokerName, buildCollectionSummary, fetchCollectionMembers, NETCASH_OPERATIONS_ROLES } from '@/lib/netcash-operations'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await requireAnyRole(request, NETCASH_OPERATIONS_ROLES)
    const body = await request.json()
    const members = await fetchCollectionMembers()
    const selectedBrokers = Array.isArray(body.brokerGroups) ? body.brokerGroups : null
    const filteredMembers = selectedBrokers
      ? members.filter((member) => selectedBrokers.includes(member.broker_code || 'Direct') || selectedBrokers.includes(brokerName(member)))
      : members
    const summary = buildCollectionSummary(filteredMembers)
    const actionDate = String(body.actionDate || new Date().toISOString().slice(0, 10).replace(/-/g, ''))
    const compactActionDate = actionDate.replace(/-/g, '')

    return NextResponse.json({
      success: true,
      mode: 'prepared',
      message: 'Netcash collection batch prepared successfully.',
      runId: `collection-${compactActionDate}`,
      batch: {
        batch_number: `NC-${compactActionDate}-001`,
        action_date: actionDate,
        instruction: body.instruction || 'TwoDay',
        total_members: summary.totalMembers,
        total_amount: summary.totalAmount,
        status: 'ready_for_submission',
      },
    })
  } catch (error) {
    console.error('Error generating Netcash collection batch:', error)
    return NextResponse.json({ error: 'Failed to generate batch' }, { status: 500 })
  }
}
