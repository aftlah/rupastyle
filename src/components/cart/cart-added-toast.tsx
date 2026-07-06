'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { CheckCircle2, ShoppingBag, X, Zap } from 'lucide-react'

interface CartAddedToastProps {
  open: boolean
  productName?: string
  onClose: () => void
  durationMs?: number
}

export default function CartAddedToast({
  open,
  productName,
  onClose,
  durationMs = 3500,
}: CartAddedToastProps) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, durationMs)
    return () => clearTimeout(timer)
  }, [open, onClose, durationMs])

  if (!open) return null

  return (
    <div className="fixed top-24 right-4 sm:right-6 z-[60] w-[min(100%,20rem)] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative overflow-hidden rounded-xl border-4 border-foreground bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
        <div className="bg-primary px-4 py-2 border-b-4 border-foreground flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="h-4 w-4 text-white fill-white shrink-0" />
            <p className="text-[11px] font-black uppercase tracking-widest text-white truncate">
              Keranjang
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            aria-label="Tutup notifikasi"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="flex items-start gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-green-100 text-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-tight text-foreground leading-snug">
              Berhasil ditambahkan!
            </p>
            {productName ? (
              <p className="mt-1 truncate text-xs font-bold text-muted-foreground normal-case">
                {productName}
              </p>
            ) : null}
            <Link
              href="/cart"
              className="mt-3 inline-flex items-center gap-1.5 border-2 border-foreground bg-primary text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wide rounded-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Lihat Keranjang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
