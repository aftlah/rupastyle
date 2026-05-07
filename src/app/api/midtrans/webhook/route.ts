import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhooks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const hashData = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`
    const signatureKey = crypto.createHash('sha512').update(hashData).digest('hex')

    if (signatureKey !== body.signature_key) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
    }

    const { transaction_status, order_id, payment_type, transaction_time } = body

    let newStatus = 'pending'

    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        newStatus = 'paid'
        break
      case 'pending':
        newStatus = 'pending'
        break
      case 'deny':
      case 'cancel':
      case 'expire':
        newStatus = 'failed'
        break
    }

    // Update order in Supabase
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        status: newStatus === 'paid' ? 'processing' : newStatus, // Order status
        payment_status: newStatus, // Payment status
        payment_type: payment_type,
        paid_at: newStatus === 'paid' ? transaction_time : null,
        payment_status_raw: JSON.stringify(body),
      })
      .eq('midtrans_order_id', order_id)

    if (error) {
      console.error('Webhook update error:', error)
      return NextResponse.json({ message: 'Database update failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'OK' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
