import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Product } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getProductPricing(product: Pick<Product, "price" | "variants">) {
  const basePrice = Number(product.price) || 0
  const rawPromoPrice = Number(product.variants?.promo?.price)
  const rawPromoPercent = Number(product.variants?.promo?.percent)
  const promoLabel = product.variants?.promo?.label?.trim() || null
  const hasPromoPercent =
    Number.isFinite(rawPromoPercent) && rawPromoPercent > 0 && rawPromoPercent < 100 && basePrice > 0
  const promoPriceFromPercent = hasPromoPercent
    ? Math.max(Math.round(basePrice * (1 - rawPromoPercent / 100)), 0)
    : null
  const hasLegacyPromoPrice = Number.isFinite(rawPromoPrice) && rawPromoPrice > 0 && rawPromoPrice < basePrice
  const promoPrice = promoPriceFromPercent ?? (hasLegacyPromoPrice ? rawPromoPrice : null)
  const promoPercent = hasPromoPercent
    ? rawPromoPercent
    : promoPrice !== null && basePrice > 0
      ? Math.round(((basePrice - promoPrice) / basePrice) * 100)
      : null
  const hasPromo = promoPrice !== null && promoPrice < basePrice
  const finalPrice = promoPrice ?? basePrice
  const discountPercent =
    hasPromo && basePrice > 0 ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0

  return {
    basePrice,
    finalPrice,
    promoPrice,
    promoPercent,
    promoLabel,
    hasPromo,
    discountPercent,
  }
}
