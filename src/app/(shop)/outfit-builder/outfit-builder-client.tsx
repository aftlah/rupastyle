'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store/use-cart-store'
import { formatCurrency, getProductPricing } from '@/lib/utils'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'

interface OutfitBuilderClientProps {
  tops: Product[]
  bottoms: Product[]
}

export default function OutfitBuilderClient({ tops, bottoms }: OutfitBuilderClientProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [selectedTop, setSelectedTop] = useState<Product | null>(tops[0] || null)
  const [selectedBottom, setSelectedBottom] = useState<Product | null>(bottoms[0] || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTopPricing = selectedTop ? getProductPricing(selectedTop) : null
  const selectedBottomPricing = selectedBottom ? getProductPricing(selectedBottom) : null
  const totalPrice = (selectedTopPricing?.finalPrice || 0) + (selectedBottomPricing?.finalPrice || 0)

  const getPrimaryImage = (product: Product | null) => {
    if (!product) return null
    return product.images?.find((i) => i.is_primary)?.image_url || product.images?.[0]?.image_url || null
  }

  const addProductToCart = (product: Product) => {
    const primaryImage = getPrimaryImage(product)
    const defaultSize = product.variants?.sizes?.[0]
    const defaultColor = product.variants?.colors?.[0]
    const pricing = getProductPricing(product, defaultSize ?? null)

    addItem({
      id: Math.random().toString(36).substring(7),
      productId: product.id,
      name: product.name,
      price: pricing.finalPrice,
      originalPrice: pricing.hasPromo ? pricing.basePrice : undefined,
      promoLabel: pricing.promoLabel ?? undefined,
      image: primaryImage || PLACEHOLDER,
      quantity: 1,
      size: defaultSize,
      color: defaultColor,
    })
  }

  const handleAddToCart = async () => {
    if (!selectedTop || !selectedBottom) return
    setError(null)

    if (selectedTop.stock < 1 || selectedBottom.stock < 1) {
      setError('Salah satu produk stok habis.')
      return
    }

    setIsLoading(true)
    addProductToCart(selectedTop)
    addProductToCart(selectedBottom)
    window.dispatchEvent(new CustomEvent('cart-updated'))
    setIsLoading(false)
    router.push('/cart')
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-8 space-y-12 order-2 xl:order-1">
        <ProductPicker
          title="Pilih Atasan"
          badge="01"
          badgeClass="bg-primary text-white"
          selectedId={selectedTop?.id}
          products={tops}
          onSelect={setSelectedTop}
          selectedClass="bg-primary/10 border-primary"
        />
        <ProductPicker
          title="Pilih Bawahan"
          badge="02"
          badgeClass="bg-yellow-400 text-black"
          selectedId={selectedBottom?.id}
          products={bottoms}
          onSelect={setSelectedBottom}
          selectedClass="bg-yellow-50 border-yellow-500"
        />
      </div>

      <div className="xl:col-span-4 space-y-6 order-1 xl:order-2 xl:sticky xl:top-32">
        <div className="border-4 border-foreground p-8 bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-xl">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center border-b-4 border-foreground pb-4">
            Outfit Preview
          </h2>

          <div className="space-y-4 flex flex-col items-center">
            <PreviewCard product={selectedTop} label="Atasan" />
            <PreviewCard product={selectedBottom} label="Bawahan" />
          </div>

          <div className="mt-8 pt-8 border-t-4 border-foreground">
            <div className="flex justify-between items-end mb-6">
              <span className="font-black uppercase text-sm text-muted-foreground">Total Estimasi</span>
              <span className="text-3xl font-black text-primary">{formatCurrency(totalPrice)}</span>
            </div>

            {error ? (
              <p className="text-sm font-bold text-destructive mb-4 text-center">{error}</p>
            ) : null}

            <Button
              onClick={handleAddToCart}
              disabled={!selectedTop || !selectedBottom || isLoading}
              className="w-full border-4 border-foreground bg-primary text-white font-black text-xl uppercase h-16 shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-xl"
            >
              {isLoading ? 'Memproses...' : 'Beli Outfit Ini'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductPicker({
  title,
  badge,
  badgeClass,
  selectedId,
  products,
  onSelect,
  selectedClass,
}: {
  title: string
  badge: string
  badgeClass: string
  selectedId?: string
  products: Product[]
  onSelect: (p: Product) => void
  selectedClass: string
}) {
  return (
    <div className="bg-white border-4 border-foreground p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl">
      <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
        <span className={`${badgeClass} px-3 py-1 rounded-xl`}>{badge}</span>
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const image =
            product.images?.find((i) => i.is_primary)?.image_url ||
            product.images?.[0]?.image_url ||
            PLACEHOLDER
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className={`group relative text-left border-2 border-foreground transition-all p-3 rounded-xl ${
                selectedId === product.id
                  ? `${selectedClass} shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-1 -translate-y-1`
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="relative aspect-square w-full bg-background border-2 border-foreground/10 mb-3 overflow-hidden rounded-xl">
                <Image src={image} alt={product.name} fill className="object-cover" />
              </div>
              <p className="font-bold text-sm line-clamp-1 mb-1">{product.name}</p>
              <p className="text-primary font-black text-sm">{formatCurrency(getProductPricing(product).finalPrice)}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PreviewCard({ product, label }: { product: Product | null; label: string }) {
  const image =
    product?.images?.find((i) => i.is_primary)?.image_url ||
    product?.images?.[0]?.image_url ||
    PLACEHOLDER

  return (
    <div className="relative w-full aspect-[4/5] max-w-[280px] border-4 border-foreground bg-background shadow-[6px_6px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden rounded-xl">
      {product ? (
        <>
          <Image src={image} alt={product.name} fill className="object-contain p-6" />
          <div className="absolute bottom-2 left-2 bg-white border-2 border-foreground px-3 py-1 text-[10px] font-black uppercase rounded-xl">
            {product.name}
          </div>
        </>
      ) : (
        <span className="text-muted-foreground font-black uppercase text-xs">Pilih {label}</span>
      )}
    </div>
  )
}
