'use client'

import PaymentButton from '@/components/checkout/payment-button'

export default function PayButton({ snapToken }: { snapToken: string }) {
  return <PaymentButton snapToken={snapToken} />
}
