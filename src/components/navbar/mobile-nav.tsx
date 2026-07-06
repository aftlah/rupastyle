'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import CartButton from './cart-button'

interface MobileNavProps {
  isLoggedIn: boolean
}

export default function MobileNav({ isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Produk' },
    { href: '/outfit-builder', label: 'Outfit Builder' },
    { href: '/stores', label: 'Toko' },
  ]

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border-4 border-foreground p-2 rounded-xl bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
        aria-label="Menu"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full border-b-4 border-foreground bg-white z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 font-black uppercase border-2 border-foreground rounded-xl hover:bg-primary/10"
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link href="/orders" onClick={() => setOpen(false)} className="block px-4 py-3 font-black uppercase border-2 border-foreground rounded-xl">
                  Pesanan Saya
                </Link>
                <div className="px-2 pt-2">
                  <CartButton initialCount={0} />
                </div>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block px-4 py-3 font-black uppercase border-4 border-foreground bg-primary text-white rounded-xl text-center">
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
