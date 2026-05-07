import { createClient } from './supabase/server'
import { getCartWithItems } from './cart'
import { generateSnapToken } from './midtrans'
import type { Order, OrderItem, OrderWithItems } from '@/types'

export async function getCheckoutData(userId: string) {
  const cart = await getCartWithItems(userId)
  return cart
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Error fetching order:', error)
    return null
  }

  return data as Order
}

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD-${timestamp}-${random}`
}

export async function createOrder(userId: string): Promise<Order> {
  const supabase = await createClient()

  const cart = await getCartWithItems(userId)

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty')
  }

  const validItems = cart.items.filter(item => item.product !== null)

  if (validItems.length === 0) {
    throw new Error('No valid items in cart')
  }

  const grossAmount = validItems.reduce((sum, item) => {
    return sum + (item.product!.price * item.quantity)
  }, 0)

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    throw new Error('User not found')
  }

  const orderNumber = generateOrderNumber()
  const customerName = userData.user.email?.split('@')[0] || 'Customer'
  const customerEmail = userData.user.email || ''

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      gross_amount: grossAmount,
      shipping_address: '',
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: '',
      midtrans_order_id: orderNumber,
    })
    .select()
    .single()

  if (orderError) {
    throw orderError
  }

  const orderItems: Omit<OrderItem, 'id' | 'created_at'>[] = validItems.map(item => {
    const primaryImage = item.product!.images?.find(img => img.is_primary) || item.product!.images?.[0]
    return {
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product!.name,
      product_slug: item.product!.slug,
      price: item.product!.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image_url: primaryImage?.image_url || null,
    }
  })

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (orderItemsError) {
    throw orderItemsError
  }

  let snapToken: string | null = null
  let snapRedirectUrl: string | null = null

  try {
    const midtransResponse = await generateSnapToken({
      orderId: orderNumber,
      grossAmount: grossAmount,
      customerName: customerName,
      customerEmail: customerEmail,
    })
    snapToken = midtransResponse.token
    snapRedirectUrl = midtransResponse.redirect_url
  } catch (midtransError) {
    console.error('Midtrans token generation failed:', midtransError)
  }

  if (snapToken) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        snap_token: snapToken,
        snap_redirect_url: snapRedirectUrl,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order with snap token:', updateError)
    }

    order.snap_token = snapToken
    order.snap_redirect_url = snapRedirectUrl
  }

  const { error: deleteError } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)

  if (deleteError) {
    throw deleteError
  }

  return order
}
