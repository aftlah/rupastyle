'use client'

import { useState } from "react"
import Image from "next/image"
import type { ProductImage } from "@/types"

interface ProductImageGalleryProps {
  images: ProductImage[]
}

export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
    images.find(img => img.is_primary) || images[0] || null
  )

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
        <span className="text-muted-foreground">No Image</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {selectedImage && (
          <Image
            src={selectedImage.image_url}
            alt="Product"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className={`relative aspect-square overflow-hidden rounded-md border-2 ${
              selectedImage?.id === image.id
                ? 'border-primary'
                : 'border-transparent hover:border-border'
            }`}
          >
            <Image
              src={image.image_url}
              alt={`Product image ${image.order + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 10vw"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
