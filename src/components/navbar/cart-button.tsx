'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBasket } from 'lucide-react'

interface CartButtonProps {
  initialCount: number
}

export default function CartButton({ initialCount }: CartButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [isWobbling, setIsWobbling] = useState(false)

  useEffect(() => {
    // Listen for custom "cart-updated" event
    const handleCartUpdate = (event: any) => {
      // If we pass the new count in detail, use it
      if (event.detail?.count !== undefined) {
        setCount(event.detail.count)
      } else {
        // Otherwise just increment (simplistic, better to refetch if needed)
        setCount(prev => prev + (event.detail?.quantity || 1))
      }
      
      // Trigger wobble animation
      setIsWobbling(true)
      setTimeout(() => setIsWobbling(false), 500)
    }

    window.addEventListener('cart-updated', handleCartUpdate)
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [])

  return (
    <Link 
      href="/cart" 
      className={`relative group flex items-center gap-2 px-4 py-2 border-4 border-transparent hover:border-primary transition-all rounded-none ${isWobbling ? 'animate-cart-wobble border-primary bg-primary/10' : ''}`}
    >
      <div className="relative">
        <ShoppingBasket className={`w-7 h-7 transition-transform ${isWobbling ? 'scale-110' : 'group-hover:scale-110'}`} />
        
        {count > 0 && (
          <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] animate-in zoom-in duration-300">
            {count}
          </span>
        )}
      </div>
      <span className="text-xl font-black uppercase hidden lg:inline-block">Cart</span>
    </Link>
  )
}
