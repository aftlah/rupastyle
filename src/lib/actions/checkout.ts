'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createOrder } from '@/lib/checkout'

export async function checkoutAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cartDataRaw = formData.get('cartData') as string
  if (!cartDataRaw) {
    redirect('/checkout?error=No items in cart')
  }

  const items = JSON.parse(cartDataRaw)
  const shippingMethodRaw = (formData.get('shippingMethod') as string | null) ?? 'regular'
  const customerName = (formData.get('customerName') as string | null) ?? ''
  const customerPhone = (formData.get('customerPhone') as string | null) ?? ''
  const shippingAddress = (formData.get('shippingAddress') as string | null) ?? ''
  const note = (formData.get('note') as string | null) ?? ''

  if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
    redirect('/checkout?error=Lengkapi data penerima dan alamat pengiriman')
  }

  let redirectUrl = ''
  try {
    const order = await createOrder(user.id, items, {
      shippingMethod: shippingMethodRaw as any,
      shippingAddress,
      customerName,
      customerPhone,
      note,
    })
    revalidatePath('/cart')
    revalidatePath('/checkout')
    
    if (order.snap_redirect_url) {
      redirectUrl = order.snap_redirect_url
    } else {
      redirectUrl = `/order-success?order_id=${order.id}`
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error
    console.error('Checkout error:', error)
    redirect('/checkout?error=Checkout failed')
  }

  if (redirectUrl) {
    redirect(redirectUrl)
  }
}
