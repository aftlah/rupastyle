'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { addOutfitToCartAction } from '@/lib/actions/cart'
import { formatCurrency } from '@/lib/utils'

interface OutfitBuilderClientProps {
  tops: Product[]
  bottoms: Product[]
}

export default function OutfitBuilderClient({ tops, bottoms }: OutfitBuilderClientProps) {
  const [selectedTop, setSelectedTop] = useState<Product | null>(tops[0] || null)
  const [selectedBottom, setSelectedBottom] = useState<Product | null>(bottoms[0] || null)
  const [isLoading, setIsLoading] = useState(false)

  const totalPrice = (selectedTop?.price || 0) + (selectedBottom?.price || 0)

  const handleAddToCart = async () => {
    if (!selectedTop || !selectedBottom) return
    setIsLoading(true)
    
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { quantity: 2 } 
    }))

    const formData = new FormData()
    formData.append('topId', selectedTop.id)
    formData.append('bottomId', selectedBottom.id)
    await addOutfitToCartAction(formData)
    setIsLoading(false)
  }

  const getPrimaryImage = (product: Product | null) => {
    if (!product) return null
    return product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url || null
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Selection Section (Left/Top) */}
      <div className="xl:col-span-8 space-y-12 order-2 xl:order-1">
        {/* TOPS SELECTION */}
        <div className="bg-white border-4 border-foreground p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="bg-primary text-white px-3 py-1 rounded-xl transform -rotate-2">01</span>
            Pilih Atasan
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {tops.map(top => (
              <button 
                key={top.id}
                onClick={() => setSelectedTop(top)}
                className={`group relative text-left border-2 border-foreground transition-all p-3 rounded-xl ${
                  selectedTop?.id === top.id 
                    ? 'bg-primary/10 shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-1 -translate-y-1 border-primary' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="relative aspect-square w-full bg-background border-2 border-foreground/10 mb-3 overflow-hidden rounded-xl">
                  <Image
                    src={getPrimaryImage(top) || '/placeholder.png'}
                    alt={top.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {selectedTop?.id === top.id && (
                    <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs border-2 border-foreground">
                      ✓
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm line-clamp-1 mb-1">{top.name}</p>
                <p className="text-primary font-black text-sm">{formatCurrency(top.price)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOMS SELECTION */}
        <div className="bg-white border-4 border-foreground p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
            <span className="bg-yellow-400 text-black px-3 py-1 rounded-xl transform rotate-2">02</span>
            Pilih Bawahan
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bottoms.map(bottom => (
              <button 
                key={bottom.id}
                onClick={() => setSelectedBottom(bottom)}
                className={`group relative text-left border-2 border-foreground transition-all p-3 rounded-xl ${
                  selectedBottom?.id === bottom.id 
                    ? 'bg-yellow-50 shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-1 -translate-y-1 border-yellow-500' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="relative aspect-square w-full bg-background border-2 border-foreground/10 mb-3 overflow-hidden rounded-xl">
                  <Image
                    src={getPrimaryImage(bottom) || '/placeholder.png'}
                    alt={bottom.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {selectedBottom?.id === bottom.id && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs border-2 border-foreground">
                      ✓
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm line-clamp-1 mb-1">{bottom.name}</p>
                <p className="text-primary font-black text-sm">{formatCurrency(bottom.price)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Section (Right/Bottom) */}
      <div className="xl:col-span-4 space-y-6 order-1 xl:order-2 xl:sticky xl:top-32">
        <div className="border-4 border-foreground p-8 bg-white shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative overflow-hidden rounded-xl">
          {/* Decorative dots */}
          <div className="absolute top-4 right-4 flex gap-1">
            <div className="w-3 h-3 bg-red-400 border border-foreground rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 border border-foreground rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 border border-foreground rounded-full"></div>
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 text-center border-b-4 border-foreground pb-4">Outfit Preview</h2>
          
          <div className="space-y-4 flex flex-col items-center">
            {/* TOP PREVIEW */}
            <div className="relative w-full aspect-[4/5] max-w-[280px] border-4 border-foreground bg-background shadow-[6px_6px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden group rounded-xl">
              {selectedTop ? (
                <>
                  <Image
                    src={getPrimaryImage(selectedTop) || '/placeholder.png'}
                    alt={selectedTop.name}
                    fill
                    className="object-contain p-6 group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 bg-white border-2 border-foreground px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-xl">
                    {selectedTop.name}
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 border-2 border-foreground border-dashed rounded-full mx-auto mb-2 animate-bounce"></div>
                  <span className="text-muted-foreground font-black uppercase text-xs">Pilih Atasan</span>
                </div>
              )}
            </div>

            {/* BOTTOM PREVIEW */}
            <div className="relative w-full aspect-[4/5] max-w-[280px] border-4 border-foreground bg-background shadow-[6px_6px_0_0_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden group rounded-xl">
              {selectedBottom ? (
                <>
                  <Image
                    src={getPrimaryImage(selectedBottom) || '/placeholder.png'}
                    alt={selectedBottom.name}
                    fill
                    className="object-contain p-6 group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 bg-white border-2 border-foreground px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-xl">
                    {selectedBottom.name}
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 border-2 border-foreground border-dashed rounded-full mx-auto mb-2 animate-bounce delay-75"></div>
                  <span className="text-muted-foreground font-black uppercase text-xs">Pilih Bawahan</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t-4 border-foreground">
            <div className="flex justify-between items-end mb-6">
              <span className="font-black uppercase text-sm text-muted-foreground">Estimate Total</span>
              <span className="text-3xl font-black text-primary">{formatCurrency(totalPrice)}</span>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!selectedTop || !selectedBottom || isLoading}
              className="w-full border-4 border-foreground bg-primary text-white font-black text-xl uppercase h-16 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl disabled:opacity-50 disabled:grayscale"
            >
              {isLoading ? 'Processing...' : 'Beli Outfit Ini'}
            </Button>
            
            <p className="text-[10px] text-center mt-4 text-muted-foreground font-bold uppercase tracking-widest">
              Free Shipping for this bundle
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
