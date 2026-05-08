import CheckoutClient from "@/components/checkout/checkout-client"

export const metadata = {
  title: "Checkout - RupaStyle",
  description: "Selesaikan pesanan Anda",
};

export default async function CheckoutPage() {
  return (
    <div className="bg-background min-h-[80vh]">
      <CheckoutClient />
    </div>
  )
}
