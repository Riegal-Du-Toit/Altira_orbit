import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/lib/auth-server'
import { buildCollectionSummary, fetchCollectionMembers, NETCASH_OPERATIONS_ROLES } from '@/lib/netcash-operations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, NETCASH_OPERATIONS_ROLES)
    const members = await fetchCollectionMembers()
    return NextResponse.json(buildCollectionSummary(members))
  } catch (error) {
    console.error('Error fetching Netcash summary:', error)
    return NextResponse.json({ error: 'Failed to fetch Netcash summary' }, { status: 500 })
  }
}
