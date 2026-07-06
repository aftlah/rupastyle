import { createPublicClient } from './supabase/public'
import { createAdminClient } from './supabase/admin'
import type { Store } from '@/types'

export async function getStores(): Promise<Store[]> {
  const supabase = createPublicClient()

  let { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error?.code === 'PGRST205' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const fallback = await createAdminClient()
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('name')
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    if (error.code === 'PGRST205') {
      console.warn('Tabel stores belum ada. Jalankan: npm run setup:db')
    } else {
      console.error('Error fetching stores:', error.message, error.code)
    }
    return []
  }

  return data as Store[]
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = createPublicClient()

  let { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error?.code === 'PGRST205' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const fallback = await createAdminClient()
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error('Error fetching store:', error.message, error.code)
    return null
  }

  return data as Store
}
