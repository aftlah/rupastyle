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

export async function createOrder(userId: string, items: any[]): Promise<Order> {
  const supabase = await createClient()

  console.log('--- START CHECKOUT (STATE MGMT) ---')
  console.log('User ID:', userId)
  console.log('Items:', items.length)

  if (!items || items.length === 0) {
    console.error('ERROR: Items are empty')
    throw new Error('Cart is empty')
  }

  const grossAmount = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
  console.log('Total Amount:', grossAmount)

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error('User not found')
  }

  const orderNumber = generateOrderNumber()
  const customerName = userData.user.email?.split('@')[0] || 'Customer'
  const customerEmail = userData.user.email || ''

  console.log('Inserting order to database...')
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
    console.error('Database Error (orders):', orderError)
    throw orderError
  }
  console.log('Order record created:', order.id)

  const orderItems: Omit<OrderItem, 'id' | 'created_at'>[] = items.map(item => {
    return {
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_slug: item.productId, // Use productId as fallback slug if not provided
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image_url: item.image || null,
    }
  })

  const { error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (orderItemsError) {
    console.error('Database Error (order_items):', orderItemsError)
    throw orderItemsError
  }

  let snapToken: string | null = null
  let snapRedirectUrl: string | null = null

  console.log('Requesting Midtrans Snap Token...')
  try {
    const midtransResponse = await generateSnapToken({
      orderId: orderNumber,
      grossAmount: grossAmount,
      customerName: customerName,
      customerEmail: customerEmail,
    })
    snapToken = midtransResponse.token
    snapRedirectUrl = midtransResponse.redirect_url
    console.log('Midtrans Success. Redirect URL:', snapRedirectUrl)
  } catch (midtransError) {
    console.error('Midtrans API Error:', midtransError)
  }

  if (snapToken) {
    await supabase
      .from('orders')
      .update({
        snap_token: snapToken,
        snap_redirect_url: snapRedirectUrl,
      })
      .eq('id', order.id)

    order.snap_token = snapToken
    order.snap_redirect_url = snapRedirectUrl
  }

  console.log('--- END CHECKOUT SUCCESS ---')
  return order
}
