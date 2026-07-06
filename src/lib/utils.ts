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

export function getBasePriceForSize(
  product: Pick<Product, "price" | "variants">,
  selectedSize?: string | null
) {
  const sizePricing = product.variants?.sizePricing
  const defaultPrice = Number(product.price) || 0

  if (selectedSize && sizePricing?.[selectedSize] != null) {
    return Number(sizePricing[selectedSize]) || defaultPrice
  }

  if (sizePricing && Object.keys(sizePricing).length > 0) {
    const prices = Object.values(sizePricing)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
    if (prices.length > 0) {
      return Math.min(...prices)
    }
  }

  return defaultPrice
}

export function getProductPriceRange(product: Pick<Product, "price" | "variants">) {
  const sizePricing = product.variants?.sizePricing
  const defaultPrice = Number(product.price) || 0

  if (!sizePricing || Object.keys(sizePricing).length === 0) {
    return { min: defaultPrice, max: defaultPrice, hasRange: false }
  }

  const prices = Object.values(sizePricing)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)

  if (prices.length === 0) {
    return { min: defaultPrice, max: defaultPrice, hasRange: false }
  }

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return { min, max, hasRange: min !== max }
}

export function parseSizePricingInput(raw: string) {
  const sizePricing: Record<string, number> = {}

  for (const part of raw.split(",")) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const [size, priceRaw] = trimmed.split(":").map((value) => value.trim())
    const price = Number(priceRaw)
    if (!size || !Number.isFinite(price) || price <= 0) continue
    sizePricing[size] = price
  }

  return sizePricing
}

export function formatSizePricingInput(sizePricing?: Record<string, number>) {
  if (!sizePricing) return ""
  return Object.entries(sizePricing)
    .map(([size, price]) => `${size}:${price}`)
    .join(", ")
}

export function getProductPricing(
  product: Pick<Product, "price" | "variants">,
  selectedSize?: string | null
) {
  const basePrice = getBasePriceForSize(product, selectedSize)
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
  const priceRange = getProductPriceRange(product)

  return {
    basePrice,
    finalPrice,
    promoPrice,
    promoPercent,
    promoLabel,
    hasPromo,
    discountPercent,
    priceRange,
  }
}
