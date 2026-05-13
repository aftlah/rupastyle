type MidtransSnapResponse = {
  token: string
  redirect_url: string
}

type MidtransStatusResponse = {
  transaction_status?: string
  status_code?: string
  status_message?: string
  payment_type?: string
  transaction_time?: string
  gross_amount?: string
  order_id?: string
  signature_key?: string
  fraud_status?: string
}

type MidtransEnvironment = 'sandbox' | 'production'

function getMidtransEnvironment(): MidtransEnvironment {
  const raw = process.env.MIDTRANS_ENV?.trim().toLowerCase()
  if (raw === 'production' || raw === 'prod') return 'production'
  return 'sandbox'
}

function getSnapUrl(env: MidtransEnvironment) {
  return env === 'sandbox'
    ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
    : 'https://app.midtrans.com/snap/v1/transactions'
}

function getCoreApiBaseUrl(env: MidtransEnvironment) {
  return env === 'sandbox'
    ? 'https://api.sandbox.midtrans.com'
    : 'https://api.midtrans.com'
}

export async function generateSnapToken({
  orderId,
  grossAmount,
  customerName,
  customerEmail,
  customerPhone,
  finishUrl,
}: {
  orderId: string
  grossAmount: number
  customerName?: string
  customerEmail: string
  customerPhone?: string
  finishUrl?: string
}): Promise<MidtransSnapResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim()
  const env = getMidtransEnvironment()

  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not set')
  }

  const authHeader = Buffer.from(`${serverKey}:`).toString('base64')
  const enabledPayments = [
    'credit_card',
    'gopay',
    'shopeepay',
    'qris',
    'bca_va',
    'bni_va',
    'bri_va',
    'permata_va',
    'other_va',
    'echannel',
    'cstore',
  ]

  const customerDetails: Record<string, unknown> = {
    first_name: customerName || 'Customer',
    email: customerEmail,
  }
  if (typeof customerPhone === 'string' && customerPhone.trim()) {
    customerDetails.phone = customerPhone.trim()
  }

  const response = await fetch(getSnapUrl(env), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    cache: 'no-store',
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount),
      },
      enabled_payments: enabledPayments,
      customer_details: customerDetails,
      ...(finishUrl ? { callbacks: { finish: finishUrl } } : {}),
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Midtrans API error: ${response.status} ${text}`)
  }

  return (await response.json()) as MidtransSnapResponse
}

export async function getMidtransTransactionStatus(orderId: string): Promise<MidtransStatusResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim()
  const env = getMidtransEnvironment()

  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY is not set')
  }

  const authHeader = Buffer.from(`${serverKey}:`).toString('base64')
  const baseUrl = getCoreApiBaseUrl(env)
  const response = await fetch(`${baseUrl}/v2/${encodeURIComponent(orderId)}/status`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Midtrans status API error: ${response.status} ${text}`)
  }

  return (await response.json()) as MidtransStatusResponse
}
