import { NextRequest, NextResponse } from 'next/server'
import { requireAnyRole } from '@/lib/auth-server'
import {
  fetchCollectionMembers,
  fetchPaymentHistoryTransactions,
  NETCASH_OPERATIONS_ROLES,
  toCollectionTransaction,
} from '@/lib/netcash-operations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireAnyRole(request, NETCASH_OPERATIONS_ROLES)
    const historyTransactions = await fetchPaymentHistoryTransactions()
    const transactions =
      historyTransactions.length > 0
        ? historyTransactions
        : (await fetchCollectionMembers()).map(toCollectionTransaction)

    return NextResponse.json({
      transactions,
      total: transactions.length,
    })
  } catch (error) {
    console.error('Error fetching Netcash collection transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
