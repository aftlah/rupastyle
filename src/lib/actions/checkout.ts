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

  let redirectUrl = ''
  try {
    const order = await createOrder(user.id, items)
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
