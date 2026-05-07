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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Pesanan Berhasil!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Terima kasih telah berbelanja di RupaStyle. Silakan selesaikan pembayaran Anda.
            </p>
            <div className="text-left p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-bold">{order.order_number}</p>
              <p className="text-sm text-muted-foreground mt-2">Total Pembayaran</p>
              <p className="font-bold text-lg">
                Rp {order.gross_amount.toLocaleString('id-ID')}
              </p>
            </div>
            {order.snap_token ? (
              <PaymentButton snapToken={order.snap_token} />
            ) : (
              <p className="text-sm text-red-500">
                Token pembayaran tidak tersedia. Silakan coba lagi nanti.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/products">Lanjut Belanja</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
