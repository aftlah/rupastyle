'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: any) => void
    }
  }
}

interface PaymentButtonProps {
  snapToken: string
}

export default function PaymentButton({ snapToken }: PaymentButtonProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://app.sandbox.midtrans.com/snap/snap.js"]')

    if (existingScript) {
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
    script.async = true

    script.onload = () => {
      setIsScriptLoaded(true)
    }

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePay = () => {
    if (window.snap && isScriptLoaded) {
      window.snap.pay(snapToken, {
        onSuccess: function (result: any) {
          console.log('Payment success:', result)
          window.location.reload()
        },
        onPending: function (result: any) {
          console.log('Payment pending:', result)
        },
        onError: function (result: any) {
          console.log('Payment error:', result)
        },
        onClose: function () {
          console.log('Customer closed the popup without finishing the payment')
        },
      })
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={!isScriptLoaded}
      className="w-full"
      size="lg"
    >
      {isScriptLoaded ? 'Bayar Sekarang' : 'Loading...'}
    </Button>
  )
}
