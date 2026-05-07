'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { addToCartAction } from "@/lib/actions/cart"
import type { Product } from "@/types"

interface AddToCartFormProps {
  product: Product
}

export default function AddToCartForm({ product }: AddToCartFormProps) {
  const sizes = product.variants?.sizes || []
  const colors = product.variants?.colors || []
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] || null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null)
  const [quantity, setQuantity] = useState(1)

  return (
    <form action={addToCartAction} className="space-y-6">
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="size" value={selectedSize || ""} />
      <input type="hidden" name="color" value={selectedColor || ""} />
      <input type="hidden" name="quantity" value={quantity} />

      {sizes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Ukuran</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  selectedSize === size
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:border-primary'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Warna</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  selectedColor === color
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input hover:border-primary'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">Jumlah</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </Button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" size="lg">
          Add to Cart
        </Button>
      </div>
    </form>
  )
}
