import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { updateCartItemAction, removeCartItemAction } from "@/lib/actions/cart"
import type { CartItem as CartItemType } from "@/types"

interface CartItemProps {
  item: CartItemType & { product: any }
}

export default function CartItem({ item }: CartItemProps) {
  const product = item.product
  const primaryImage = product?.images?.find((img: any) => img.is_primary) || product?.images?.[0]
  const subtotal = product ? product.price * item.quantity : 0

  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {primaryImage ? (
          <Link href={`/products/${product.slug}`}>
            <Image
              src={primaryImage.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </Link>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {product && (
          <Link href={`/products/${product.slug}`} className="font-semibold hover:underline">
            {product.name}
          </Link>
        )}
        <div className="text-sm text-muted-foreground space-y-1 mt-1">
          {item.size && <p>Ukuran: {item.size}</p>}
          {item.color && <p>Warna: {item.color}</p>}
        </div>
        <p className="font-bold mt-2">
          Rp {product?.price?.toLocaleString('id-ID') || 0}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <form action={updateCartItemAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <input type="hidden" name="quantity" value={Math.max(1, item.quantity - 1)} />
            <Button type="submit" size="icon" variant="outline" className="h-8 w-8">
              -
            </Button>
          </form>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <form action={updateCartItemAction}>
            <input type="hidden" name="cartItemId" value={item.id} />
            <input type="hidden" name="quantity" value={item.quantity + 1} />
            <Button type="submit" size="icon" variant="outline" className="h-8 w-8">
              +
            </Button>
          </form>
        </div>
        <p className="text-sm text-muted-foreground">
          Subtotal: <span className="font-bold text-foreground">
            Rp {subtotal.toLocaleString('id-ID')}
          </span>
        </p>
        <form action={removeCartItemAction}>
          <input type="hidden" name="cartItemId" value={item.id} />
          <Button type="submit" size="sm" variant="destructive">
            Hapus
          </Button>
        </form>
      </div>
    </div>
  )
}
