import { createAdminClient } from './supabase/admin'

type OrderLine = {
  productId: string
  quantity: number
  name?: string
}

export async function validateOrderStock(
  items: OrderLine[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  const productIds = Array.from(
    new Set(items.map((item) => item.productId).filter(Boolean))
  )

  if (productIds.length === 0) {
    return { ok: false, message: 'Keranjang tidak valid' }
  }

  const admin = createAdminClient()
  const { data: products, error } = await admin
    .from('products')
    .select('id, name, stock, is_active')
    .in('id', productIds)

  if (error) {
    return { ok: false, message: 'Gagal memvalidasi stok produk' }
  }

  const productById = new Map((products ?? []).map((p) => [p.id, p]))
  const requested = new Map<string, number>()

  for (const item of items) {
    requested.set(item.productId, (requested.get(item.productId) ?? 0) + item.quantity)
  }

  for (const [productId, qty] of requested) {
    const product = productById.get(productId)
    if (!product || !product.is_active) {
      return { ok: false, message: `Produk "${itemName(items, productId)}" tidak tersedia` }
    }
    if (product.stock < qty) {
      return {
        ok: false,
        message: `Stok "${product.name}" tidak cukup (tersedia: ${product.stock}, diminta: ${qty})`,
      }
    }
  }

  return { ok: true }
}

function itemName(items: OrderLine[], productId: string) {
  return items.find((i) => i.productId === productId)?.name ?? 'Produk'
}

export async function decrementOrderStock(orderId: string): Promise<void> {
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, payment_status, stock_adjusted')
    .eq('id', orderId)
    .maybeSingle()

  if (!order || order.payment_status !== 'paid') {
    return
  }

  if (order.stock_adjusted === true) {
    return
  }

  const { data: orderItems, error: itemsError } = await admin
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId)

  if (itemsError || !orderItems?.length) {
    return
  }

  const totals = new Map<string, number>()
  for (const item of orderItems) {
    if (!item.product_id) continue
    totals.set(item.product_id, (totals.get(item.product_id) ?? 0) + item.quantity)
  }

  for (const [productId, qty] of totals) {
    const { data: product } = await admin
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (!product) continue

    const nextStock = Math.max(0, (product.stock ?? 0) - qty)
    await admin.from('products').update({ stock: nextStock }).eq('id', productId)
  }

  await admin.from('orders').update({ stock_adjusted: true }).eq('id', orderId).then(({ error }) => {
    if (error && !error.message.includes('stock_adjusted')) {
      console.warn('Stock adjusted flag skipped:', error.message)
    }
  })
}
