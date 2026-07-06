export interface ProductVariants {
  sizes?: string[]
  colors?: string[]
  sizePricing?: Record<string, number>
  promo?: {
    price?: number | null
    percent?: number | null
    label?: string | null
  }
}

export interface Store {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  address: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Broadcast {
  id: string
  title: string
  content: string
  image_url: string | null
  link_url: string | null
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  store_id: string | null
  variants: ProductVariants
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  category?: Category | null
  store?: Store | null
  images?: ProductImage[]
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_category_id: string | null
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  is_primary: boolean
  order: number
  created_at: string
}

export interface Cart {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string | null
  bundle_id: string | null
  quantity: number
  size: string | null
  color: string | null
  created_at: string
  updated_at: string
  product?: Product | null
}

export interface CartWithItems extends Cart {
  items: (CartItem & { product: Product | null })[]
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: string
  payment_status: string
  midtrans_order_id: string | null
  snap_token: string | null
  snap_redirect_url: string | null
  gross_amount: number
  payment_type: string | null
  shipping_address: string
  shipping_method: string | null
  shipping_cost: number
  tracking_number: string | null
  shipped_at: string | null
  delivered_at: string | null
  customer_name: string
  customer_phone: string
  customer_email: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_slug: string
  price: number
  quantity: number
  size: string | null
  color: string | null
  image_url: string | null
  created_at: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}
