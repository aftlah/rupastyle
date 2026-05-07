import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutData } from "@/lib/checkout";
import { checkoutAction } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
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
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const product = item.product;
                const primaryImage =
                  product?.images?.find((img: any) => img.is_primary) ||
                  product?.images?.[0];
                const subtotal = product ? product.price * item.quantity : 0;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 border-b last:border-0"
                  >
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.image_url}
                          alt={product!.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{product?.name}</p>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        {item.size && <p>Ukuran: {item.size}</p>}
                        {item.color && <p>Warna: {item.color}</p>}
                        <p>Jumlah: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </CardContent>
            <CardFooter>
              <form action={checkoutAction} className="w-full">
                <Button type="submit" className="w-full" size="lg">
                  Checkout Sekarang
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
