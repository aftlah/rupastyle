import { createClient } from './supabase/server'
import { getCartWithItems } from './cart'
import { generateSnapToken } from './midtrans'
import type { Order, OrderItem, OrderWithItems } from '@/types'
import { getProductPricing } from './utils'

type ShippingMethod = 'regular' | 'express' | 'pickup'

function getShippingCost(method: ShippingMethod) {
  switch (method) {
    case 'regular':
      return 20000
    case 'express':
      return 40000
    case 'pickup':
      return 0
    default:
      return 20000
  }
}

function getShippingLabel(method: ShippingMethod) {
  switch (method) {
    case 'regular':
      return 'Reguler (2-4 hari)'
    case 'express':
      return 'Express (1-2 hari)'
    case 'pickup':
      return 'Ambil di Toko'
    default:
      return 'Reguler (2-4 hari)'
  }
}

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

export async function createOrder(
  userId: string,
  items: any[],
  details: {
    shippingMethod: ShippingMethod
    shippingAddress: string
    customerName: string
    customerPhone: string
    note?: string
    origin?: string
  }
): Promise<Order> {
  const supabase = await createClient()

  if (!items || items.length === 0) {
    throw new Error('Cart is empty')
  }

  const productIds = Array.from(
    new Set(
      items
        .map((item) => (typeof item.productId === 'string' ? item.productId : null))
        .filter(Boolean) as string[]
    )
  )

  const { data: products, error: productsError } = productIds.length
    ? await supabase
        .from('products')
        .select('id, name, slug, price, variants')
        .in('id', productIds)
    : { data: [], error: null }

  if (productsError) {
    throw productsError
  }

  const productById = new Map(
    ((products ?? []) as Array<{ id: string; name: string; slug: string; price: number; variants: any }>).map((product) => [
      product.id,
      product,
    ])
  )

  const normalizedItems = items.map((item) => {
    const product = item.productId ? productById.get(item.productId) : null
    const effectivePrice = product ? getProductPricing(product as any).finalPrice : Number(item.price) || 0

    return {
      ...item,
      price: effectivePrice,
      name: product?.name ?? item.name,
      slug: product?.slug ?? item.slug ?? item.productId,
    }
  })

  const subtotal = normalizedItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
  const shippingCost = getShippingCost(details.shippingMethod)
  const grossAmount = subtotal + shippingCost

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error('User not found')
  }

  const orderNumber = generateOrderNumber()
  const customerName = details.customerName?.trim() || (userData.user.email?.split('@')[0] || 'Customer')
  const customerEmail = userData.user.email || ''
  const customerPhone = details.customerPhone?.trim() || ''
  const origin = details.origin?.trim() || ''
  const shippingLabel = getShippingLabel(details.shippingMethod)
  const shippingAddress = details.shippingAddress?.trim() || ''
  const note = details.note?.trim() || ''
  const shippingAddressStored = [
    shippingAddress,
    '',
    `Metode Pengiriman: ${shippingLabel}`,
    `Ongkir: Rp ${shippingCost.toLocaleString('id-ID')}`,
    note ? `Catatan: ${note}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      gross_amount: grossAmount,
      shipping_address: shippingAddressStored,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      midtrans_order_id: orderNumber,
    })
    .select()
    .single()

  if (orderError) {
    throw orderError
  }

  const orderItems: Omit<OrderItem, 'id' | 'created_at'>[] = normalizedItems.map(item => {
    return {
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_slug: item.slug,
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
    throw orderItemsError
  }

  let snapToken: string | null = null
  let snapRedirectUrl: string | null = null

  try {
    const finishUrl = origin ? `${origin}/order-success?order_id=${encodeURIComponent(order.id)}` : undefined
    const midtransResponse = await generateSnapToken({
      orderId: orderNumber,
      grossAmount: grossAmount,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      finishUrl,
    })
    snapToken = midtransResponse.token
    snapRedirectUrl = midtransResponse.redirect_url
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

  return order
}
