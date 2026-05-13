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
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    const envRaw = (process.env.NEXT_PUBLIC_MIDTRANS_ENV || '').trim().toLowerCase()
    const env = envRaw === 'production' || envRaw === 'prod' ? 'production' : 'sandbox'
    const scriptSrc = env === 'sandbox'
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js'
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`)

    if (existingScript) {
      setIsScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = scriptSrc
    script.setAttribute('data-client-key', clientKey)
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
      setIsPaying(true)
      window.snap.pay(snapToken, {
        onSuccess: function (result: any) {
          console.log('Payment success:', result)
          window.location.reload()
        },
        onPending: function (result: any) {
          console.log('Payment pending:', result)
          setIsPaying(false)
        },
        onError: function (result: any) {
          console.log('Payment error:', result)
          setIsPaying(false)
        },
        onClose: function () {
          console.log('Customer closed the popup without finishing the payment')
          setIsPaying(false)
        },
      })
    }
  }

  return (
    <Button
      onClick={handlePay}
      isLoading={isPaying}
      disabled={!isScriptLoaded || isPaying}
      className="w-full h-14 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl mt-4"
    >
      {isScriptLoaded ? '⚡ Bayar Sekarang' : 'Memuat Snap...'}
    </Button>
  )
}
