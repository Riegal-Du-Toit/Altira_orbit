import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/lib/auth-server'
import {
  buildCollectionSummary,
  fetchCollectionMembers,
  NETCASH_OPERATIONS_ROLES,
  toCollectionTransaction,
} from '@/lib/netcash-operations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, NETCASH_OPERATIONS_ROLES)
    const strikeDate = request.nextUrl.searchParams.get('strike_date') || new Date().toISOString().slice(0, 10)
    const day = new Date(strikeDate).getDate()
    const members = await fetchCollectionMembers()
    const exactDayMembers = members.filter((member) => member.debit_order_day === day)
    const scheduledMembers = exactDayMembers.length > 0 ? exactDayMembers : members
    const transactions = scheduledMembers.map(toCollectionTransaction)

    return NextResponse.json({
      transactions,
      summary: buildCollectionSummary(scheduledMembers),
      strike_date: strikeDate,
      debit_order_day: exactDayMembers.length > 0 ? day : 'collection-cycle',
      cycle_fallback: exactDayMembers.length === 0,
    })
  } catch (error) {
    console.error('Error fetching Netcash collection transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch today transactions' }, { status: 500 })
  }
}
