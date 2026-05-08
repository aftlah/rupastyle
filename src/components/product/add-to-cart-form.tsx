'use client'

import { useState } from "react"
import { useCartStore } from "@/store/use-cart-store"
import { Button } from "@/components/ui/button"
import { Plus, Minus, CheckCircle2 } from "lucide-react"
import type { Product } from "@/types"

interface AddToCartFormProps {
  product: Product
}

export default function AddToCartForm({ product }: AddToCartFormProps) {
  const addItem = useCartStore((state) => state.addItem)
  const sizes = product.variants?.sizes || []
  const colors = product.variants?.colors || []
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
    
    addItem({
      id: Math.random().toString(36).substring(7),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage?.image_url || '',
      quantity: quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    })

    setTimeout(() => {
      setIsLoading(false)
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    }, 500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="size" value={selectedSize || ""} />
      <input type="hidden" name="color" value={selectedColor || ""} />
      <input type="hidden" name="quantity" value={quantity} />

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Pilih Ukuran
            <div className="h-[2px] flex-1 bg-foreground/10"></div>
          </h3>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`min-w-[50px] h-12 px-4 border-4 font-black transition-all ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-1 -translate-y-1'
                    : 'border-foreground bg-white hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Pilih Warna
            <div className="h-[2px] flex-1 bg-foreground/10"></div>
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-12 px-6 border-4 font-black transition-all uppercase text-sm ${
                  selectedColor === color
                    ? 'border-primary bg-primary text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-1 -translate-y-1'
                    : 'border-foreground bg-white hover:bg-gray-50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and CTA */}
      <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
        {/* Quantity Controller */}
        <div className="flex items-center border-4 border-foreground bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] h-16 w-full sm:w-auto">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-full w-14 rounded-none hover:bg-primary/10 transition-colors border-r-4 border-foreground"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus className="w-5 h-5" />
          </Button>
          
          <span className="w-16 text-center font-black text-2xl">{quantity}</span>
          
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-full w-14 rounded-none hover:bg-primary/10 transition-colors border-l-4 border-foreground"
            onClick={() => setQuantity(quantity + 1)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Add to Cart Button */}
        <div className="flex-1 w-full">
          <Button 
            type="submit" 
            className={`w-full h-16 border-4 border-foreground font-black uppercase text-xl transition-all relative overflow-hidden group shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] rounded-none ${
              isAdded ? 'bg-green-500 text-white' : 'bg-primary text-white'
            }`}
            disabled={isAdded || isLoading}
            isLoading={isLoading}
          >
            <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${isAdded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
              Add to Cart
            </span>
            
            {/* Animation Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-500 ${isAdded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
              <span>Berhasil!</span>
            </div>
          </Button>
        </div>
      </div>
      
      {/* Toast Notification (Simple CSS Version) */}
      {isAdded && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="bg-foreground text-white px-8 py-4 border-4 border-primary shadow-[8px_8px_0_0_rgba(255,255,255,0.2)] font-black uppercase tracking-widest flex items-center gap-4">
            <span className="text-2xl">⚡</span>
            Produk berhasil masuk keranjang!
          </div>
        </div>
      )}
    </form>
  )
}
