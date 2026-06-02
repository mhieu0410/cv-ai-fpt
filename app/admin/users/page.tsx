import { createAdminClient } from '@/lib/supabase-admin'
import UsersTable, { type UserRow } from './UsersTable'

export default async function AdminUsersPage() {
  const db = createAdminClient()

  const { data, error } = await db
    .from('profiles')
    .select('id, email, plan, pro_expires_at, created_at, cvs(count), orders(count)')
    .order('created_at', { ascending: false })

  if (error) console.error('[admin/users] query error:', error)

  const users: UserRow[] = (data ?? []).map((u: Record<string, unknown>) => ({
    id: u.id as string,
    email: u.email as string,
    plan: (u.plan as string) ?? 'free',
    pro_expires_at: u.pro_expires_at as string | null,
    created_at: u.created_at as string,
    cvCount: ((u.cvs as { count: number }[])?.[0]?.count ?? 0),
    orderCount: ((u.orders as { count: number }[])?.[0]?.count ?? 0),
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-800">Quản lý người dùng</h1>
      <UsersTable users={users} />
    </div>
  )
}
