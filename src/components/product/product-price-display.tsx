'use client'

import { useMemo, useState } from "react"
import type { Product } from "@/types"
import { formatCurrency, getProductPricing } from "@/lib/utils"

interface ProductPriceDisplayProps {
  product: Product
}

export default function ProductPriceDisplay({ product }: ProductPriceDisplayProps) {
  const sizes = product.variants?.sizes || []
  const [selectedSize] = useState<string | null>(sizes[0] || null)
  const pricing = useMemo(() => getProductPricing(product, selectedSize), [product, selectedSize])

  if (pricing.priceRange.hasRange && !pricing.hasPromo) {
    return (
      <p className="text-2xl font-bold text-primary">
        {formatCurrency(pricing.priceRange.min)} – {formatCurrency(pricing.priceRange.max)}
      </p>
    )
  }

  if (pricing.hasPromo) {
    return (
      <div className="space-y-2">
        {pricing.promoLabel ? (
          <span className="inline-flex border-2 border-foreground bg-yellow-300 px-3 py-1 text-xs font-black uppercase rounded-xl">
            {pricing.promoLabel}
          </span>
        ) : null}
        <p className="text-lg font-bold text-muted-foreground line-through">
          {formatCurrency(pricing.basePrice)}
        </p>
        <p className="text-3xl font-black text-primary">
          {formatCurrency(pricing.finalPrice)}
        </p>
      </div>
    )
  }

  return <p className="text-2xl font-bold text-primary">{formatCurrency(pricing.finalPrice)}</p>
}
