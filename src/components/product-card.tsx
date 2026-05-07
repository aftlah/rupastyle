import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="border-2 border-foreground bg-white overflow-hidden transition-all shadow-[4px_4px_0_0_rgba(0,0,0,0.9)] hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.9)] hover:-translate-y-2 h-full flex flex-col rounded-md">
        <div className="relative aspect-square overflow-hidden bg-background border-b-2 border-foreground p-4">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground font-bold uppercase tracking-widest">
              No Image
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col bg-white">
          {product.category && (
            <span className="inline-block border border-foreground bg-primary/10 text-primary text-xs font-bold uppercase px-3 py-1 mb-3 self-start rounded-full">
              {product.category.name}
            </span>
          )}
          <h3 className="font-bold text-lg line-clamp-2 tracking-tight leading-snug mb-3 flex-1 text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-xl font-black text-foreground">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </Link>
  )
}
