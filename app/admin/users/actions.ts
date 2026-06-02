'use server'

import { createAdminClient } from '@/lib/supabase-admin'

export async function getUserDetail(userId: string) {
  const db = createAdminClient()

  const [cvResult, orderResult] = await Promise.all([
    db.from('cvs')
      .select('id, title, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    db.from('orders')
      .select('id, order_code, status, amount, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  return {
    cvs: (cvResult.data ?? []) as { id: string; title: string; created_at: string }[],
    orders: (orderResult.data ?? []) as {
      id: string
      order_code: string
      status: string
      amount: number
      created_at: string
    }[],
  }
}
