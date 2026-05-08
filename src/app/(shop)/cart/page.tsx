import CartClient from "@/components/cart/cart-client"

export const metadata = {
  title: "Keranjang Belanja | RupaStyle",
  description: "Lihat dan kelola keranjang belanja Anda",
}

export default async function CartPage() {
  return (
    <div className="bg-background min-h-[80vh]">
      <CartClient />
    </div>
  )
}
