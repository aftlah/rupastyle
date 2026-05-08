import midtransClient from 'midtrans-client'

export async function generateSnapToken({
  orderId,
  grossAmount,
  customerName,
  customerEmail,
  customerPhone,
}: {
  orderId: string
  grossAmount: number
  customerName?: string
  customerEmail: string
  customerPhone?: string
}) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim()

  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not set')
  }

  // Initialize Midtrans Snap client
  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: serverKey,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim() || ''
  })

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(grossAmount),
    },
    customer_details: {
      first_name: customerName || 'Customer',
      email: customerEmail,
      phone: customerPhone,
    },
    // Adding credit_card configuration for better support
    credit_card: {
      secure: true
    }
  }

  try {
    const transaction = await snap.createTransaction(parameter)
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url
    }
  } catch (error: any) {
    console.error('Midtrans Client Error:', error)
    if (error.ApiResponse) {
      console.error('Midtrans API Detail:', error.ApiResponse)
    }
    throw error
  }
}
