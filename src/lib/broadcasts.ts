import { createPublicClient } from './supabase/public'
import { createAdminClient } from './supabase/admin'
import type { Broadcast } from '@/types'

export async function getActiveBroadcasts(): Promise<Broadcast[]> {
  const supabase = createPublicClient()

  let { data, error } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error?.code === 'PGRST205' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const fallback = await createAdminClient()
      .from('broadcasts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    if (error.code === 'PGRST205') {
      console.warn('Tabel broadcasts belum ada. Jalankan: npm run setup:db')
    } else {
      console.error('Error fetching broadcasts:', error.message, error.code)
    }
    return []
  }

  const current = Date.now()

  return (data ?? []).filter((broadcast) => {
    const startsAt = broadcast.starts_at ? new Date(broadcast.starts_at).getTime() : null
    const endsAt = broadcast.ends_at ? new Date(broadcast.ends_at).getTime() : null

    if (startsAt && startsAt > current) return false
    if (endsAt && endsAt < current) return false
    return true
  }) as Broadcast[]
}
