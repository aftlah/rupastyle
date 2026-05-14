import CheckoutClient from "@/components/checkout/checkout-client"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Checkout - RupaStyle",
  description: "Selesaikan pesanan Anda",
};

export default async function CheckoutPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="bg-background min-h-[80vh]">
      <CheckoutClient initialEmail={user?.email ?? ""} />
    </div>
  )
}
