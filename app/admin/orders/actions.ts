'use server'

import { createAdminClient } from '@/lib/supabase-admin'

type OrderStatus = 'pending' | 'awaiting_review' | 'paid' | 'rejected'

interface Order {
  id: string
  order_code: string
  amount: number
  status: OrderStatus
  bank_txn_id: string | null
  created_at: string
  paid_at: string | null
  note: string | null
  profiles: { email: string } | null
}

export async function loadOrders(): Promise<Order[]> {
  const db = createAdminClient()

  const { data, error } = await db
    .from('orders')
    .select('id, order_code, amount, status, bank_txn_id, created_at, paid_at, note, profiles(email)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const rows = (data ?? []).map(r => ({
    ...r,
    profiles: Array.isArray(r.profiles) ? (r.profiles[0] ?? null) : r.profiles,
  })) as unknown as Order[]

  return rows.sort((a, b) => {
    if (a.status === 'awaiting_review' && b.status !== 'awaiting_review') return -1
    if (a.status !== 'awaiting_review' && b.status === 'awaiting_review') return 1
    return 0
  })
}