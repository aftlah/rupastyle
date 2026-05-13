import Link from "next/link"
import { notFound } from "next/navigation"
import { getOrderById } from "@/lib/checkout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import PaymentButton from "@/components/checkout/payment-button"

interface OrderSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata = {
  title: "Pesanan Berhasil - RupaStyle",
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams
  const orderId = params.order_id as string | undefined

  if (!orderId) {
    notFound()
  }

  const order = await getOrderById(orderId)

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex justify-center">
        <Card className="w-full max-w-lg border-4 border-foreground rounded-xl shadow-[16px_16px_0_0_rgba(0,0,0,1)] bg-white overflow-hidden">
          <CardHeader className="bg-green-400 border-b-4 border-foreground py-10">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-xl border-4 border-foreground bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
              <svg
                className="h-12 w-12 text-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-4xl font-black uppercase tracking-tighter text-center">Pesanan Berhasil!</CardTitle>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <p className="text-lg font-bold text-center leading-tight">
              YEAY! Terima kasih telah berbelanja di RupaStyle. <br/>
              Satu langkah lagi, silakan selesaikan pembayaran Anda.
            </p>
            
            <div className="space-y-4 border-4 border-foreground p-6 bg-secondary shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] rounded-xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Number</p>
                <p className="font-black text-xl uppercase italic">{order.order_number}</p>
              </div>
              <div className="pt-4 border-t-2 border-foreground/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Pembayaran</p>
                <p className="font-black text-3xl text-primary drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  Rp {order.gross_amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {order.snap_token ? (
              <PaymentButton snapToken={order.snap_token} />
            ) : (
              <div className="p-4 border-4 border-destructive bg-destructive/10 text-destructive font-black uppercase text-xs text-center rounded-xl">
                Token pembayaran tidak tersedia. Silakan hubungi admin.
              </div>
            )}
          </CardContent>
          <CardFooter className="p-10 pt-0 flex flex-col gap-4">
            <Button asChild variant="outline" className="w-full h-14 border-4 border-foreground bg-white text-foreground font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl">
              <Link href="/products">Lanjut Belanja</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
