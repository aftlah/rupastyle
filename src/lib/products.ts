import { createPublicClient } from './supabase/public'
import { createAdminClient } from './supabase/admin'
import type { Category, Product } from '@/types'
import { getProductPricing } from './utils'

export type ProductSort = 'newest' | 'price-asc' | 'price-desc' | 'name'

export type ProductFilters = {
  q?: string
  category?: string
  store?: string
  sort?: ProductSort
  featured?: boolean
}

const productSelectWithStore = `
  *,
  category:categories(*),
  store:stores(*),
  images:product_images(*)
`

const productSelectBasic = `
  *,
  category:categories(*),
  images:product_images(*)
`

function sortProducts(products: Product[]) {
  return [...products].sort((a, b) => {
    if (a.is_featured !== b.is_featured) {
      return a.is_featured ? -1 : 1
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

async function fetchActiveProducts() {
  const supabase = createPublicClient()

  let result = await supabase
    .from('products')
    .select(productSelectWithStore)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (result.error?.code === 'PGRST200' || result.error?.code === 'PGRST205') {
    result = await supabase
      .from('products')
      .select(productSelectBasic)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
  }

  if (result.error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient()
    result = await admin
      .from('products')
      .select(productSelectWithStore)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (result.error?.code === 'PGRST200' || result.error?.code === 'PGRST205') {
      result = await admin
        .from('products')
        .select(productSelectBasic)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    }
  }

  return result
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await fetchActiveProducts()

  if (error) {
    console.error('Error fetching products:', error.message, error.code)
    return []
  }

  return sortProducts(data as Product[])
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts()
  return products.filter((product) => product.is_featured)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient()

  let result = await supabase
    .from('products')
    .select(productSelectWithStore)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (result.error?.code === 'PGRST200' || result.error?.code === 'PGRST205') {
    result = await supabase
      .from('products')
      .select(productSelectBasic)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
  }

  if (result.error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient()
    result = await admin
      .from('products')
      .select(productSelectWithStore)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (result.error?.code === 'PGRST200' || result.error?.code === 'PGRST205') {
      result = await admin
        .from('products')
        .select(productSelectBasic)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
    }
  }

  if (result.error) {
    console.error('Error fetching product:', result.error.message, result.error.code)
    return null
  }

  return result.data as Product
}

export async function getCategories() {
  const supabase = createPublicClient()

  let { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const fallback = await createAdminClient().from('categories').select('*').order('name')
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error('Error fetching categories:', error.message, error.code)
    return []
  }

  return data
}

function applyProductFilters(products: Product[], filters: ProductFilters) {
  let result = [...products]
  const q = filters.q?.trim().toLowerCase()

  if (q) {
    result = result.filter((product) => {
      const haystack = [
        product.name,
        product.description ?? '',
        product.category?.name ?? '',
        product.store?.name ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }

  if (filters.category) {
    result = result.filter((product) => product.category?.slug === filters.category)
  }

  if (filters.store) {
    result = result.filter((product) => product.store?.slug === filters.store)
  }

  if (filters.featured) {
    result = result.filter((product) => product.is_featured)
  }

  const sort = filters.sort ?? 'newest'
  result.sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'price-asc' || sort === 'price-desc') {
      const priceA = getProductPricing(a).finalPrice
      const priceB = getProductPricing(b).finalPrice
      return sort === 'price-asc' ? priceA - priceB : priceB - priceA
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return result
}

export async function getFilteredProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const products = await getProducts()
  return applyProductFilters(products, filters)
}

export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  return getFilteredProducts({ category: slug })
}

export async function getProductsByStoreSlug(slug: string): Promise<Product[]> {
  return getFilteredProducts({ store: slug })
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = (await getCategories()) as Category[]
  return categories.find((c) => c.slug === slug) ?? null
}

export async function getProductsForBroadcastSelect() {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('products')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching products for broadcast:', error.message)
    return []
  }

  return data as Pick<Product, 'id' | 'name' | 'slug'>[]
}
