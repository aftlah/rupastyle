'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Broadcast } from '@/types'
import { Megaphone, X } from 'lucide-react'

interface BroadcastBannerProps {
  broadcasts: Broadcast[]
}

export default function BroadcastBanner({ broadcasts }: BroadcastBannerProps) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const visibleBroadcasts = broadcasts.filter((b) => !dismissed.includes(b.id))

  useEffect(() => {
    if (visibleBroadcasts.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibleBroadcasts.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [visibleBroadcasts.length])

  if (visibleBroadcasts.length === 0) return null

  const current = visibleBroadcasts[currentIndex] ?? visibleBroadcasts[0]

  return (
    <div className="bg-primary text-white border-b-4 border-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <Megaphone className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-black uppercase text-sm truncate">{current.title}</p>
          <p className="text-xs font-medium opacity-90 line-clamp-1">{current.content}</p>
        </div>
        {current.link_url ? (
          <Link
            href={current.link_url}
            className="text-xs font-black uppercase border-2 border-white px-3 py-1 hover:bg-white hover:text-primary transition-colors rounded-xl flex-shrink-0"
          >
            {current.link_url.startsWith('/products/') ? 'Lihat Produk' : 'Lihat'}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => setDismissed((prev) => [...prev, current.id])}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
          aria-label="Tutup siaran"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
