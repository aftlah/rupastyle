export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  category_id: string | null
  variants: {
    sizes?: string[]
    colors?: string[]
  }
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category | null
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
