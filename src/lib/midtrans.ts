type MidtransSnapResponse = {
  token: string
  redirect_url: string
}

const MIDTRANS_SNAP_SANDBOX_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions'

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
}): Promise<MidtransSnapResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim()

  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not set')
  }

  const authHeader = Buffer.from(`${serverKey}:`).toString('base64')

  const response = await fetch(MIDTRANS_SNAP_SANDBOX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount),
      },
      customer_details: {
        first_name: customerName || 'Customer',
        email: customerEmail,
        phone: customerPhone,
      },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Midtrans API error: ${response.status} ${text}`)
  }

  return (await response.json()) as MidtransSnapResponse
}
