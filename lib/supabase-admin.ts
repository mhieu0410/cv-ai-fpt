// CHỈ DÙNG SERVER-SIDE. KHÔNG IMPORT TỪ COMPONENT BROWSER.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Tạo Supabase client với service_role key — bypass RLS hoàn toàn. */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
