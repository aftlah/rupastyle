'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createOrder } from '@/lib/checkout'

export async function checkoutAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  try {
    const order = await createOrder(user.id)
    revalidatePath('/cart')
    revalidatePath('/checkout')
    
    if (order.snap_redirect_url) {
      redirect(order.snap_redirect_url)
    } else {
      redirect(`/order-success?order_id=${order.id}`)
    }
  } catch (error) {
    console.error('Checkout error:', error)
    redirect('/checkout?error=Checkout failed')
  }
}
