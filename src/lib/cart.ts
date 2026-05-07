import { createClient } from './supabase/server'
import type { CartWithItems } from '@/types'

export async function getOrCreateCart(userId: string) {
  const supabase = await createClient()
  
  const { data: existingCart, error: fetchError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError
  }

  if (existingCart) {
    return existingCart
  }

  const { data: newCart, error: createError } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select()
    .single()

  if (createError) {
    throw createError
  }

  return newCart
}

export async function getCartWithItems(userId: string): Promise<CartWithItems | null> {
  const supabase = await createClient()
  
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select(`
      *,
      items:cart_items(
        *,
        product:products(
          *,
          images:product_images(*)
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { foreignTable: 'items', ascending: true })
    .single()

  if (cartError) {
    if (cartError.code === 'PGRST116') {
      return null
    }
    throw cartError
  }

  return cart as CartWithItems
}

export async function addToCart(
  userId: string,
  { productId, size, color, quantity, bundleId }: {
    productId?: string
    size?: string
    color?: string
    quantity: number
    bundleId?: string
  }
) {
  const supabase = await createClient()
  const cart = await getOrCreateCart(userId)

  if (!productId && !bundleId) {
    throw new Error('Either productId or bundleId is required')
  }

  const existingItemQuery = supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)

  if (productId) {
    existingItemQuery.eq('product_id', productId)
    if (size) existingItemQuery.eq('size', size)
    if (color) existingItemQuery.eq('color', color)
  } else if (bundleId) {
    existingItemQuery.eq('bundle_id', bundleId)
  }

  const { data: existingItem } = await existingItemQuery.single()

  if (existingItem) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      cart_id: cart.id,
      product_id: productId || null,
      bundle_id: bundleId || null,
      size: size || null,
      color: color || null,
      quantity,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const supabase = await createClient()

  if (quantity < 1) {
    throw new Error('Quantity must be at least 1')
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeCartItem(cartItemId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)

  if (error) throw error
}
