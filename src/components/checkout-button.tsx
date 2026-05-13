'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

export function CheckoutButton() {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      className="w-full h-14 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl"
      isLoading={pending}
      disabled={pending}
    >
      Bayar Sekarang
    </Button>
  )
}
