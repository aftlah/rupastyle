'use client'

import { useCartStore } from "@/store/use-cart-store"
import CartItem from "./cart-item"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function CartClient() {
  const { items, getTotalPrice } = useCartStore()
  const [isLoaded, setIsLoaded] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const total = getTotalPrice()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12 border-b-4 border-foreground pb-6">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
          Keranjang <span className="text-primary underline decoration-4 underline-offset-4">Belanja</span>
        </h1>
        <p className="text-muted-foreground font-bold mt-2 italic">
          {items.length} Barang dalam keranjang Anda
        </p>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-24 border-4 border-dashed border-foreground/20 bg-white shadow-[8px_8px_0_0_rgba(0,0,0,0.05)] rounded-xl">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-primary/20">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-2xl font-black uppercase mb-2">Keranjang Anda masih kosong!</h2>
          <p className="text-muted-foreground font-bold mb-8 max-w-md mx-auto">
            Yuk, mulai belanja produk fashion pria terbaik untuk gaya maksimal lo.
          </p>
          <Button asChild size="lg" className="h-14 px-10 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl">
            <Link href="/#koleksi">Mulai Belanja</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* List Items */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] divide-y-4 divide-foreground/5 overflow-hidden rounded-xl">
              {items.map((item) => (
                <CartItem key={item.id} item={item as any} />
              ))}
            </div>
            
            <Link href="/#koleksi" className="inline-flex items-center gap-2 font-black uppercase text-sm hover:text-primary transition-colors group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Lanjut Belanja
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white border-4 border-foreground p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-xl">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8 border-b-4 border-foreground pb-4">
                Ringkasan Pesanan
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground uppercase text-sm">Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-muted-foreground uppercase text-sm">Pengiriman</span>
                  <span className="text-green-600 uppercase text-sm">Gratis</span>
                </div>
                <div className="border-t-4 border-foreground pt-4 flex justify-between">
                  <span className="font-black uppercase">Total</span>
                  <span className="text-3xl font-black text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button 
                className="w-full h-16 border-4 border-foreground bg-primary text-white font-black uppercase text-xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl" 
                asChild
              >
                <Link href="/checkout">Checkout Sekarang</Link>
              </Button>
              
              <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Safe Payment</span>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
