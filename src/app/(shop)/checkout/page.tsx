import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutData } from "@/lib/checkout";
import { checkoutAction } from "@/lib/actions/checkout";
import { CheckoutButton } from "@/components/checkout-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Checkout - RupaStyle",
  description: "Selesaikan pesanan Anda",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const cart = await getCheckoutData(user.id);
  const items = cart?.items || [];

  if (items.length === 0) {
    redirect("/products");
  }

  const total = items.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-4 border-foreground rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-white overflow-hidden">
            <CardHeader className="bg-foreground text-white border-b-4 border-foreground">
              <CardTitle className="text-xl font-black uppercase tracking-widest">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {items.map((item) => {
                const product = item.product;
                const primaryImage =
                  product?.images?.find((img: any) => img.is_primary) ||
                  product?.images?.[0];
                const subtotal = product ? product.price * item.quantity : 0;

                return (
                  <div
                    key={item.id}
                    className="flex gap-6 py-6 border-b-4 border-foreground/5 last:border-0"
                  >
                    <div className="relative w-24 h-24 border-4 border-foreground rounded-none overflow-hidden bg-muted flex-shrink-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.image_url}
                          alt={product!.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs font-black uppercase">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-lg font-black uppercase truncate">{product?.name}</p>
                      <div className="text-sm font-bold text-muted-foreground space-y-1 mt-1">
                        {item.size && <p className="flex items-center gap-2">
                          <span className="bg-secondary px-2 py-0.5 border border-foreground/10 text-[10px]">SIZE</span> 
                          {item.size}
                        </p>}
                        {item.color && <p className="flex items-center gap-2">
                          <span className="bg-secondary px-2 py-0.5 border border-foreground/10 text-[10px]">COLOR</span>
                          {item.color}
                        </p>}
                        <p className="flex items-center gap-2">
                          <span className="bg-secondary px-2 py-0.5 border border-foreground/10 text-[10px]">QTY</span>
                          {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center text-right">
                      <p className="text-xl font-black">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-4 border-foreground rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-white sticky top-24">
            <CardHeader className="bg-primary text-white border-b-4 border-foreground">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-center">Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-sm">Subtotal</span>
                <span className="font-black text-lg">Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-sm">Pajak (0%)</span>
                <span className="font-black text-lg">Rp 0</span>
              </div>
              <div className="border-t-4 border-foreground pt-6 flex justify-between items-center">
                <span className="font-black uppercase tracking-tighter text-xl">Total Akhir</span>
                <span className="font-black text-3xl text-primary drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <form action={checkoutAction} className="w-full">
                <CheckoutButton />
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
