'use client'

import { useMemo, useState } from "react"
import { useCartStore } from "@/store/use-cart-store"
import { Button } from "@/components/ui/button"
import CartAddedToast from "@/components/cart/cart-added-toast"
import { Plus, Minus, CheckCircle2 } from "lucide-react"
import type { Product } from "@/types"
import { formatCurrency, getProductPricing } from "@/lib/utils"

interface AddToCartFormProps {
  product: Product
}

export default function AddToCartForm({ product }: AddToCartFormProps) {
  const addItem = useCartStore((state) => state.addItem)
  const sizes = product.variants?.sizes || []
  const colors = product.variants?.colors || []
  const sizePricing = product.variants?.sizePricing || {}
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const pricing = useMemo(
    () => getProductPricing(product, selectedSize),
    [product, selectedSize]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (product.stock < 1) {
      return
    }

    if (quantity > product.stock) {
      return
    }

    setIsLoading(true)
    
    const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
    
    addItem({
      id: Math.random().toString(36).substring(7),
      productId: product.id,
      name: product.name,
      price: pricing.finalPrice,
      originalPrice: pricing.hasPromo ? pricing.basePrice : undefined,
      promoLabel: pricing.promoLabel ?? undefined,
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

      {sizes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Pilih Ukuran
            <div className="h-[2px] flex-1 bg-foreground/10"></div>
          </h3>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const sizePrice = sizePricing[size]
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[70px] h-auto px-4 py-2 border-4 font-black transition-all rounded-xl ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-1 -translate-y-1'
                      : 'border-foreground bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="block">{size}</span>
                  {sizePrice ? (
                    <span className={`block text-[10px] mt-0.5 ${selectedSize === size ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {formatCurrency(sizePrice)}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      )}

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
                className={`h-12 px-6 border-4 font-black transition-all uppercase text-sm rounded-xl ${
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

      <div className="border-2 border-foreground/10 rounded-xl p-4 bg-primary/5 space-y-2">
        <p className="text-xs font-black uppercase text-muted-foreground">Harga dipilih</p>
        {pricing.hasPromo ? (
          <div className="flex items-baseline gap-3">
            <span className="text-sm line-through text-muted-foreground">{formatCurrency(pricing.basePrice)}</span>
            <span className="text-2xl font-black text-primary">{formatCurrency(pricing.finalPrice)}</span>
          </div>
        ) : (
          <p className="text-2xl font-black text-primary">{formatCurrency(pricing.finalPrice)}</p>
        )}
        <p className={`text-xs font-black uppercase ${product.stock < 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
          Stok: {product.stock}
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center border-4 border-foreground bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] h-16 w-full sm:w-auto rounded-xl overflow-hidden">
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
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 w-full">
          <Button 
            type="submit" 
            className={`w-full h-16 border-4 border-foreground font-black uppercase text-xl transition-all relative overflow-hidden group shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] rounded-xl ${
              isAdded ? 'bg-green-500 text-white' : 'bg-primary text-white'
            }`}
            disabled={isAdded || isLoading || product.stock < 1}
            isLoading={isLoading}
          >
            <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${isAdded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
              {isAdded ? 'Berhasil!' : product.stock < 1 ? 'Stok Habis' : 'Add to Cart'}
            </span>
            
            <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-500 ${isAdded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
              <span>Berhasil!</span>
            </div>
          </Button>
        </div>
      </div>

      <CartAddedToast
        open={isAdded}
        productName={product.name}
        onClose={() => setIsAdded(false)}
      />
    </form>
  )
}
