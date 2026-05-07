import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCartWithItems } from "@/lib/cart"
import CartItem from "@/components/cart/cart-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Keranjang Belanja - RupaStyle",
  description: "Lihat dan kelola keranjang belanja Anda",
}

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cart = await getCartWithItems(user.id)
  const items = cart?.items || []
  const total = items.reduce((sum, item) => {
    if (item.product) {
      return sum + (item.product.price * item.quantity)
    }
    return sum
  }, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Keranjang Anda kosong</h2>
          <p className="text-muted-foreground mb-6">Yuk, mulai belanja produk fashion wanita terbaik!</p>
          <Button asChild>
            <Link href="/products">Mulai Belanja</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
