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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Preview Section */}
      <div className="border-4 border-black p-6 bg-pink-100 neo-shadow flex flex-col items-center justify-center space-y-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Preview</h2>
        
        <div className="w-64 h-64 border-4 border-black bg-white relative neo-shadow flex items-center justify-center overflow-hidden">
          {selectedTop ? (
            <Image
              src={getPrimaryImage(selectedTop) || '/placeholder.png'}
              alt={selectedTop.name}
              fill
              className="object-contain p-4"
            />
          ) : (
            <span className="text-muted-foreground font-medium">Pilih Atasan</span>
          )}
        </div>

        <div className="w-64 h-64 border-4 border-black bg-white relative neo-shadow flex items-center justify-center overflow-hidden">
          {selectedBottom ? (
            <Image
              src={getPrimaryImage(selectedBottom) || '/placeholder.png'}
              alt={selectedBottom.name}
              fill
              className="object-contain p-4"
            />
          ) : (
            <span className="text-muted-foreground font-medium">Pilih Bawahan</span>
          )}
        </div>

        <div className="bg-white border-4 border-black p-4 neo-shadow w-64 text-center mt-4">
          <p className="font-bold text-xl mb-1">Total Harga</p>
          <p className="text-primary text-2xl font-black">{formatCurrency(totalPrice)}</p>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!selectedTop || !selectedBottom || isLoading}
          size="lg"
          className="w-64 border-2 border-black neo-shadow-sm font-bold text-lg uppercase h-14 bg-black text-white hover:bg-black/90"
        >
          {isLoading ? 'Menambahkan...' : 'Add to Cart'}
        </Button>
      </div>

      {/* Selection Section */}
      <div className="space-y-10">
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
            Pilih Atasan
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tops.map(top => (
              <div 
                key={top.id}
                onClick={() => setSelectedTop(top)}
                className={`cursor-pointer border-2 border-black transition-all p-2 ${
                  selectedTop?.id === top.id ? 'bg-primary/20 neo-shadow' : 'bg-white hover:neo-shadow-sm hover:-translate-y-1'
                }`}
              >
                <div className="relative aspect-square w-full bg-gray-50 border border-black/10 mb-2">
                  <Image
                    src={getPrimaryImage(top) || '/placeholder.png'}
                    alt={top.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-bold text-sm truncate">{top.name}</p>
                <p className="text-primary text-sm font-semibold">{formatCurrency(top.price)}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight mb-4 border-b-2 border-black pb-2">
            Pilih Bawahan
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {bottoms.map(bottom => (
              <div 
                key={bottom.id}
                onClick={() => setSelectedBottom(bottom)}
                className={`cursor-pointer border-2 border-black transition-all p-2 ${
                  selectedBottom?.id === bottom.id ? 'bg-primary/20 neo-shadow' : 'bg-white hover:neo-shadow-sm hover:-translate-y-1'
                }`}
              >
                <div className="relative aspect-square w-full bg-gray-50 border border-black/10 mb-2">
                  <Image
                    src={getPrimaryImage(bottom) || '/placeholder.png'}
                    alt={bottom.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="font-bold text-sm truncate">{bottom.name}</p>
                <p className="text-primary text-sm font-semibold">{formatCurrency(bottom.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
