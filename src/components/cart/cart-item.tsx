import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { updateCartItemAction, removeCartItemAction } from "@/lib/actions/cart"
import type { CartItem as CartItemType } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Trash2, Plus, Minus } from "lucide-react"

interface CartItemProps {
  item: CartItemType & { product: any }
}

export default function CartItem({ item }: CartItemProps) {
  const product = item.product
  const primaryImage = product?.images?.find((img: any) => img.is_primary) || product?.images?.[0]
  const subtotal = product ? product.price * item.quantity : 0

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 group transition-colors hover:bg-primary/5">
      {/* Product Image */}
      <div className="relative w-full sm:w-32 aspect-square border-4 border-foreground bg-background overflow-hidden flex-shrink-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
        {primaryImage ? (
          <Link href={`/products/${product.slug}`}>
            <Image
              src={primaryImage.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 128px"
            />
          </Link>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs font-bold uppercase">
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-col gap-1">
          {product ? (
            <Link 
              href={`/products/${product.slug}`} 
              className="text-xl font-black uppercase tracking-tight hover:text-primary transition-colors line-clamp-1"
            >
              {product.name}
            </Link>
          ) : (
            <span className="text-xl font-black uppercase italic text-muted-foreground">Produk dihapus</span>
          )}
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold uppercase text-muted-foreground">
            {item.size && (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                Size: <span className="text-foreground">{item.size}</span>
              </span>
            )}
            {item.color && (
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                Color: <span className="text-foreground">{item.color}</span>
              </span>
            )}
            {item.bundle_id && (
              <span className="bg-yellow-300 text-black px-2 py-0.5 text-[10px] border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ml-2">
                Outfit Bundle
              </span>
            )}
          </div>
        </div>

        <div className="pt-2">
          <p className="text-2xl font-black text-primary">
            {formatCurrency(product?.price || 0)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4">
        {/* Quantity Controller */}
        <div className="flex items-center border-4 border-foreground bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] h-12">
          <form action={updateCartItemAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <input type="hidden" name="quantity" value={Math.max(1, item.quantity - 1)} />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="h-full w-10 rounded-none hover:bg-primary/10 transition-colors border-r-4 border-foreground"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </form>
          
          <span className="w-12 text-center font-black text-lg">{item.quantity}</span>
          
          <form action={updateCartItemAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <input type="hidden" name="quantity" value={item.quantity + 1} />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="h-full w-10 rounded-none hover:bg-primary/10 transition-colors border-l-4 border-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Subtotal</p>
            <p className="font-black text-lg">{formatCurrency(subtotal)}</p>
          </div>

          <form action={removeCartItemAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <Button 
              type="submit" 
              size="icon" 
              variant="destructive" 
              className="h-12 w-12 border-4 border-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-none"
              title="Hapus"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
