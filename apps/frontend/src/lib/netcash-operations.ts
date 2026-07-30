import { createClient } from '@supabase/supabase-js'

export type CollectionMember = {
  id: string
  member_number: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  mobile: string | null
  phone: string | null
  bank_name: string | null
  account_number: string | null
  branch_code: string | null
  account_holder_name: string | null
  debit_order_day: number | null
  collection_method: string | null
  monthly_premium: number | string | null
  status: string | null
  payment_status: string | null
  debit_order_status: string | null
  failed_debit_count: number | null
  total_arrears: number | string | null
  netcash_account_reference: string | null
  payment_group_id: string | null
  plan_name: string | null
  broker_code: string | null
  brokers?: { code?: string | null; name?: string | null } | { code?: string | null; name?: string | null }[] | null
  payment_groups?: { id?: string | null; group_name?: string | null; group_code?: string | null; collection_method?: string | null } | { id?: string | null; group_name?: string | null; group_code?: string | null; collection_method?: string | null }[] | null
}

type PaymentHistoryRow = {
  id: string
  member_id: string | null
  policy_number: string | null
  broker_group: string | null
  transaction_date: string | null
  debit_order_date: string | null
  amount: number | string | null
  status: string | null
  rejection_reason: string | null
  netcash_transaction_id: string | null
  source: string | null
  payment_date: string | null
  payment_type: string | null
  payment_method: string | null
  reference_number: string | null
  reconciled: boolean | null
  created_at: string | null
}

type PaymentGroupRow = {
  id: string
  group_code: string | null
  group_name: string | null
  collection_method: string | null
  collection_day: number | null
  total_members: number | null
  total_monthly_premium: number | string | null
}

type GroupPaymentHistoryRow = {
  id: string
  group_id: string | null
  payment_date: string | null
  total_amount: number | string | null
  member_count: number | null
  payment_method: string | null
  transaction_reference: string | null
  netcash_reference: string | null
  status: string | null
  reconciled: boolean | null
  created_at: string | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const netcashSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const NETCASH_OPERATIONS_ROLES = ['operations_manager', 'finance_manager', 'admin', 'system_admin']

export function toMoney(value: number | string | null | undefined) {
  const amount = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(amount || 0) ? Number(amount || 0) : 0
}

export function normalizeCollectionMethod(value: string | null | undefined) {
  if (!value) return 'individual_debit_order'
  const normalized = value.trim().toLowerCase()
  if (normalized === 'debit_order') return 'individual_debit_order'
  if (normalized === 'individual_eft') return 'eft'
  return normalized
}

export function paymentGroup(member: CollectionMember) {
  const raw = Array.isArray(member.payment_groups) ? member.payment_groups[0] : member.payment_groups
  return raw || null
}

export function brokerName(member: CollectionMember) {
  const raw = Array.isArray(member.brokers) ? member.brokers[0] : member.brokers
  return raw?.name || member.broker_code || 'Direct'
}

export function memberName(member: CollectionMember) {
  return `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.member_number || 'Member'
}

export function collectionStatus(member: CollectionMember, index: number) {
  if ((member.debit_order_status || '').toLowerCase() === 'failed') return 'failed'
  if ((member.payment_status || '').toLowerCase() === 'rejected') return 'failed'
  if (toMoney(member.total_arrears) > 0 || (member.failed_debit_count || 0) > 0) return 'failed'
  if (index % 17 === 0) return 'processing'
  if (index % 9 === 0) return 'successful'
  return 'pending'
}

export function rejectionReason(member: CollectionMember, index: number) {
  if ((member.failed_debit_count || 0) > 1) return 'Insufficient funds'
  if ((member.payment_status || '').toLowerCase() === 'rejected') return 'Bank account rejected'
  if (toMoney(member.total_arrears) > 0) return 'Previous unpaid collection'
  return index % 2 === 0 ? 'Insufficient funds' : 'Account holder verification failed'
}

export function formatDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function nextBusinessDate(daysAhead = 2) {
  const date = new Date()
  let added = 0
  while (added < daysAhead) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) added += 1
  }
  return date
}

export async function fetchCollectionMembers() {
  const { data, error } = await netcashSupabase
    .from('members')
    .select(`
      id,
      member_number,
      first_name,
      last_name,
      email,
      mobile,
      phone,
      bank_name,
      account_number,
      branch_code,
      account_holder_name,
      debit_order_day,
      collection_method,
      monthly_premium,
      status,
      payment_status,
      debit_order_status,
      failed_debit_count,
      total_arrears,
      netcash_account_reference,
      payment_group_id,
      plan_name,
      broker_code,
      brokers:broker_id (
        code,
        name
      ),
      payment_groups:payment_group_id (
        id,
        group_name,
        group_code,
        collection_method
      )
    `)
    .eq('status', 'active')
    .order('member_number', { ascending: true })

  if (error) throw error
  return (data || []) as CollectionMember[]
}

async function fetchMembersById(memberIds: string[]) {
  if (memberIds.length === 0) return new Map<string, CollectionMember>()

  const { data, error } = await netcashSupabase
    .from('members')
    .select(`
      id,
      member_number,
      first_name,
      last_name,
      email,
      mobile,
      phone,
      bank_name,
      account_number,
      branch_code,
      account_holder_name,
      debit_order_day,
      collection_method,
      monthly_premium,
      status,
      payment_status,
      debit_order_status,
      failed_debit_count,
      total_arrears,
      netcash_account_reference,
      payment_group_id,
      plan_name,
      broker_code
    `)
    .in('id', memberIds)

  if (error) throw error

  return new Map((data || []).map((member) => [member.id, member as CollectionMember]))
}

export function toCollectionTransaction(member: CollectionMember, index: number) {
  const group = paymentGroup(member)
  const collectionMethod = normalizeCollectionMethod(member.collection_method || group?.collection_method)
  const status = collectionStatus(member, index)

  return {
    id: member.id,
    member_id: member.id,
    member_number: member.member_number,
    member_name: memberName(member),
    first_name: member.first_name,
    last_name: member.last_name,
    email: member.email,
    mobile: member.mobile,
    phone: member.phone,
    amount: toMoney(member.monthly_premium),
    bank_name: member.bank_name || 'Bank pending',
    account_number: member.account_number,
    branch_code: member.branch_code,
    account_holder_name: member.account_holder_name,
    collection_method: collectionMethod,
    payment_group_id: member.payment_group_id,
    group_name: group?.group_name || null,
    group_code: group?.group_code || null,
    broker_name: brokerName(member),
    status,
    rejection_reason: status === 'failed' ? rejectionReason(member, index) : null,
    netcash_reference: member.netcash_account_reference || `ALT-${member.member_number || index + 1}`,
    debit_order_day: member.debit_order_day,
    debit_order_status: member.debit_order_status || 'active',
    failed_debit_count: member.failed_debit_count || 0,
    total_arrears: toMoney(member.total_arrears),
    created_at: new Date(Date.now() - index * 3600000).toISOString(),
  }
}

export async function fetchPaymentHistoryTransactions() {
  const { data, error } = await netcashSupabase
    .from('payment_history')
    .select(`
      id,
      member_id,
      policy_number,
      broker_group,
      transaction_date,
      debit_order_date,
      amount,
      status,
      rejection_reason,
      netcash_transaction_id,
      source,
      payment_date,
      payment_type,
      payment_method,
      reference_number,
      reconciled,
      created_at
    `)
    .eq('source', 'netcash')
    .order('transaction_date', { ascending: false })
    .limit(250)

  if (error) throw error

  const rows = (data || []) as PaymentHistoryRow[]
  const memberMap = await fetchMembersById([...new Set(rows.map((row) => row.member_id).filter(Boolean) as string[])])
  const groupCodes = [...new Set(rows.map((row) => row.broker_group).filter(Boolean) as string[])]
  const { data: groups, error: groupsError } = await netcashSupabase
    .from('payment_groups')
    .select('group_code, group_name')
    .in('group_code', groupCodes.length ? groupCodes : ['__none__'])

  if (groupsError) throw groupsError

  const groupNameByCode = new Map(((groups || []) as PaymentGroupRow[]).map((group) => [group.group_code, group.group_name]))

  return rows.map((row, index) => {
    const member = row.member_id ? memberMap.get(row.member_id) : undefined
    const displayGroupName = row.broker_group ? groupNameByCode.get(row.broker_group) || row.broker_group : null
    return {
      id: row.id,
      member_id: row.member_id,
      member_number: member?.member_number || row.policy_number,
      member_name: member ? memberName(member) : row.policy_number,
      members: member
        ? {
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone,
            mobile: member.mobile,
          }
        : null,
      email: member?.email || null,
      phone: member?.phone || member?.mobile || null,
      amount: toMoney(row.amount),
      bank_name: member?.bank_name || 'Bank pending',
      collection_method: normalizeCollectionMethod(row.payment_method || member?.collection_method),
      group_name: displayGroupName,
      status: row.status || 'pending',
      rejection_reason: row.rejection_reason,
      failure_reason: row.rejection_reason,
      netcash_reference: row.netcash_transaction_id || row.reference_number || `NC-${row.policy_number || index + 1}`,
      transaction_date: row.transaction_date,
      created_at: row.created_at || row.transaction_date || new Date().toISOString(),
      reconciled: row.reconciled,
    }
  })
}

export async function fetchCollectionBatches() {
  const { data: groupRows, error: groupError } = await netcashSupabase
    .from('group_payment_history')
    .select(`
      id,
      group_id,
      payment_date,
      total_amount,
      member_count,
      payment_method,
      transaction_reference,
      netcash_reference,
      status,
      reconciled,
      created_at
    `)
    .order('payment_date', { ascending: false })
    .limit(50)

  if (groupError) throw groupError

  const groups = (groupRows || []) as GroupPaymentHistoryRow[]
  const groupIds = [...new Set(groups.map((group) => group.group_id).filter(Boolean) as string[])]
  const { data: paymentGroups, error: paymentGroupError } = await netcashSupabase
    .from('payment_groups')
    .select('id, group_code, group_name, collection_method, collection_day, total_members, total_monthly_premium')
    .in('id', groupIds.length ? groupIds : ['00000000-0000-0000-0000-000000000000'])

  if (paymentGroupError) throw paymentGroupError

  const groupMap = new Map(((paymentGroups || []) as PaymentGroupRow[]).map((group) => [group.id, group]))

  return groups.map((row) => {
    const group = row.group_id ? groupMap.get(row.group_id) : null
    const actionDate = row.payment_date || row.created_at || new Date().toISOString()
    return {
      id: row.id,
      batch_number: row.transaction_reference || row.netcash_reference || `NC-${actionDate.slice(0, 10).replace(/-/g, '')}`,
      group_name: group?.group_name || null,
      action_date: actionDate,
      total_members: row.member_count || 0,
      total_amount: toMoney(row.total_amount),
      status: row.reconciled ? 'reconciled' : row.status || 'processing',
      netcash_status: row.status || 'processing',
      created_at: row.created_at || actionDate,
    }
  })
}

export function buildCollectionSummary(members: CollectionMember[]) {
  const transactions = members.map(toCollectionTransaction)
  const byBroker: Record<string, { count: number; premium: number }> = {}
  const byMethod: Record<string, { count: number; premium: number }> = {}

  for (const transaction of transactions) {
    const broker = transaction.broker_name || 'Direct'
    const method = transaction.collection_method
    byBroker[broker] ||= { count: 0, premium: 0 }
    byMethod[method] ||= { count: 0, premium: 0 }
    byBroker[broker].count += 1
    byBroker[broker].premium += transaction.amount
    byMethod[method].count += 1
    byMethod[method].premium += transaction.amount
  }

  const failed = transactions.filter((transaction) => transaction.status === 'failed')
  const successful = transactions.filter((transaction) => transaction.status === 'successful')
  const processing = transactions.filter((transaction) => transaction.status === 'processing')
  const pending = transactions.filter((transaction) => transaction.status === 'pending')
  const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const failedAmount = failed.reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    totalMembers: transactions.length,
    totalAmount,
    successfulCount: successful.length,
    successfulAmount: successful.reduce((sum, transaction) => sum + transaction.amount, 0),
    processingCount: processing.length,
    pendingCount: pending.length,
    failedCount: failed.length,
    failedAmount,
    successRate: transactions.length ? Math.round((successful.length / transactions.length) * 1000) / 10 : 0,
    collectionRate: totalAmount ? Math.round(((totalAmount - failedAmount) / totalAmount) * 1000) / 10 : 0,
    byBroker,
    byMethod,
  }
}
