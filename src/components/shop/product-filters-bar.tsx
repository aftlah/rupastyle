'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/types'
import type { ProductSort } from '@/lib/products'

interface ProductFiltersBarProps {
  categories: Category[]
  total: number
}

export default function ProductFiltersBar({ categories, total }: ProductFiltersBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = (searchParams.get('sort') ?? 'newest') as ProductSort

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <input
          type="search"
          defaultValue={q}
          placeholder="Cari produk..."
          className="flex-1 h-12 px-4 border-2 border-foreground font-bold rounded-xl bg-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateParams({ q: (e.target as HTMLInputElement).value.trim() })
            }
          }}
        />
        <select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="h-12 px-4 border-2 border-foreground font-bold rounded-xl bg-white min-w-[180px]"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="h-12 px-4 border-2 border-foreground font-bold rounded-xl bg-white min-w-[180px]"
        >
          <option value="newest">Terbaru</option>
          <option value="price-asc">Harga Terendah</option>
          <option value="price-desc">Harga Tertinggi</option>
          <option value="name">Nama A-Z</option>
        </select>
      </div>
      <p className="text-sm font-bold text-muted-foreground">{total} produk ditemukan</p>
    </div>
  )
}
