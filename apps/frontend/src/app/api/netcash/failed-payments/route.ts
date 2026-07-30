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
    const historyPayments = await fetchPaymentHistoryTransactions()
    const sourcePayments =
      historyPayments.length > 0
        ? historyPayments
        : (await fetchCollectionMembers()).map(toCollectionTransaction)
    const failedPayments = sourcePayments
      .filter((transaction) => transaction.status === 'failed' || transaction.status === 'rejected')
      .slice(0, 25)
      .map((transaction: any) => ({
        ...transaction,
        status: 'failed',
        failure_reason: transaction.rejection_reason || transaction.failure_reason || 'Collection unsuccessful',
      }))

    return NextResponse.json({
      failedPayments,
      total: failedPayments.length,
    })
  } catch (error) {
    console.error('Error fetching Netcash failed payments:', error)
    return NextResponse.json({ error: 'Failed to fetch failed payments' }, { status: 500 })
  }
}
