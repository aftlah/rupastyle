'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { checkoutAction } from '@/lib/actions/checkout'

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: any) => void
    }
  }
}

interface PayButtonProps {
  disabled?: boolean
}

export default function PayButton({ disabled }: PayButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [snapToken, setSnapToken] = useState<string | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      const result = await checkoutAction()
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? 'Memproses...' : 'Bayar Sekarang'}
    </Button>
  )
}
