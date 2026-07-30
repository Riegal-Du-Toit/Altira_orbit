import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/lib/auth-server'
import { formatDate, NETCASH_OPERATIONS_ROLES, nextBusinessDate } from '@/lib/netcash-operations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, NETCASH_OPERATIONS_ROLES)
    const daysAhead = Number(request.nextUrl.searchParams.get('daysAhead') || '2')
    const date = nextBusinessDate(Number.isFinite(daysAhead) ? daysAhead : 2)

    return NextResponse.json({
      formatted: formatDate(date),
      display: date.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    })
  } catch (error) {
    console.error('Error calculating next Netcash debit date:', error)
    return NextResponse.json({ error: 'Failed to calculate next debit date' }, { status: 500 })
  }
}
