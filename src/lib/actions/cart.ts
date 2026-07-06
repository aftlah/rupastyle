'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addToCart, updateCartItem, removeCartItem } from '@/lib/cart'

export async function addToCartAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const productId = formData.get('productId') as string
  const size = formData.get('size') as string | undefined
  const color = formData.get('color') as string | undefined
  const quantity = parseInt(formData.get('quantity') as string) || 1

  try {
    await addToCart(user.id, { productId, size, color, quantity })
    revalidatePath('/cart')
    revalidatePath('/products/[slug]', 'page')
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}

export async function updateCartItemAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cartItemId = formData.get('cartItemId') as string
  const quantity = parseInt(formData.get('quantity') as string)

  if (isNaN(quantity) || quantity < 1) {
    return
  }

  try {
    await updateCartItem(cartItemId, quantity)
    revalidatePath('/cart')
  } catch (error) {
    console.error('Error updating cart item:', error)
  }
}

export async function removeCartItemAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cartItemId = formData.get('cartItemId') as string

  try {
    await removeCartItem(cartItemId)
    revalidatePath('/cart')
  } catch (error) {
    console.error('Error removing cart item:', error)
  }
}
