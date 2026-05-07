interface MidtransTransactionDetails {
  order_id: string
  gross_amount: number
}

interface MidtransCustomerDetails {
  first_name?: string
  email: string
  phone?: string
}

interface MidtransSnapRequest {
  transaction_details: MidtransTransactionDetails
  customer_details: MidtransCustomerDetails
}

interface MidtransSnapResponse {
  token: string
  redirect_url: string
}

const MIDTRANS_SANDBOX_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions'

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
  const serverKey = process.env.MIDTRANS_SERVER_KEY

  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not set')
  }

  const authHeader = Buffer.from(serverKey + ':').toString('base64')

  const requestBody: MidtransSnapRequest = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customerName || 'Customer',
      email: customerEmail,
      phone: customerPhone,
    },
  }

  const response = await fetch(MIDTRANS_SANDBOX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authHeader}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Midtrans API error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}
