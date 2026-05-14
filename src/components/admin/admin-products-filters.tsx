"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminProductsFiltersProps {
  initialQuery: string
  initialCategory: string
  initialStatus: string
  totalProducts: number
  filteredCount: number
  categories: Array<{
    id: string
    name: string
  }>
}

export default function AdminProductsFilters({
  initialQuery,
  initialCategory,
  initialStatus,
  totalProducts,
  filteredCount,
  categories,
}: AdminProductsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    setCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const hasActiveFilters = Boolean(query.trim() || category || status)

  const updateUrl = useMemo(
    () => (next: { q?: string; category?: string; status?: string }) => {
      const params = new URLSearchParams(searchParams.toString())

      const nextQuery = next.q ?? query
      const nextCategory = next.category ?? category
      const nextStatus = next.status ?? status

      if (nextQuery.trim()) {
        params.set("q", nextQuery.trim())
      } else {
        params.delete("q")
      }

      if (nextCategory) {
        params.set("category", nextCategory)
      } else {
        params.delete("category")
      }

      if (nextStatus) {
        params.set("status", nextStatus)
      } else {
        params.delete("status")
      }

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      router.replace(nextUrl, { scroll: false })
    },
    [category, pathname, query, router, searchParams, status]
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const currentQuery = searchParams.get("q") ?? ""
      if (query.trim() !== currentQuery.trim()) {
        updateUrl({ q: query })
      }
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [query, searchParams, updateUrl])

  return (
    <div className="flex flex-col gap-4 bg-white border-4 border-foreground p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl">
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="text"
            placeholder="Search products by name, slug, or ID..."
            className="w-full h-12 pl-12 pr-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 xl:min-w-[420px]">
          <div className="relative flex-1">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <select
              value={category}
              onChange={(event) => {
                const nextCategory = event.target.value
                setCategory(nextCategory)
                updateUrl({ category: nextCategory })
              }}
              className="w-full h-12 pl-11 pr-4 border-2 border-foreground bg-white font-black uppercase text-sm outline-none rounded-xl"
            >
              <option value="">All Categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name.toLowerCase()}>
                  {item.name}
                </option>
              ))}
              <option value="uncategorized">Uncategorized</option>
            </select>
          </div>

          <select
            value={status}
            onChange={(event) => {
              const nextStatus = event.target.value
              setStatus(nextStatus)
              updateUrl({ status: nextStatus })
            }}
            className="h-12 min-w-[150px] px-4 border-2 border-foreground bg-white font-black uppercase text-sm outline-none rounded-xl"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>

          {hasActiveFilters ? (
            <Button asChild type="button" variant="outline" className="h-12 border-2 border-foreground font-black uppercase px-6 rounded-xl">
              <Link href="/admin/products">
                <X size={16} className="mr-2" /> Reset
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Menampilkan {filteredCount} dari {totalProducts} produk
      </p>
    </div>
  )
}
