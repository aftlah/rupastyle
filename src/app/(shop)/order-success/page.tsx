import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { getOrderById } from "@/lib/checkout"
import {
  getMidtransTransactionStatus,
  mapMidtransTransactionToOrderUpdate,
  resolveSnapTokenForOrder,
} from "@/lib/midtrans"
import { createAdminClient } from "@/lib/supabase/admin"
import { decrementOrderStock } from "@/lib/inventory"
import OrderSuccessCard from "@/components/checkout/order-success-card"

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

  const admin = createAdminClient()

  let currentPaymentStatus = order.payment_status
  let currentOrderStatus = order.status
  if (currentPaymentStatus !== "paid") {
    try {
      const midtransOrderId = order.midtrans_order_id ?? order.order_number
      const status = await getMidtransTransactionStatus(midtransOrderId)

      if (status?.transaction_status) {
        const update = mapMidtransTransactionToOrderUpdate(
          status.transaction_status,
          status.payment_type ?? order.payment_type
        )

        if (
          update &&
          ((update.payment_status !== currentPaymentStatus) || (update.status !== currentOrderStatus))
        ) {
          const { error } = await admin.from("orders").update(update).eq("id", order.id)
          if (error) {
            console.warn("Midtrans status sync skipped:", error.message)
          } else {
            currentPaymentStatus = update.payment_status
            currentOrderStatus = update.status
            if (update.payment_status === "paid") {
              await decrementOrderStock(order.id)
            }
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync error"
      console.warn("Midtrans status sync skipped:", message)
    }
  }

  let isPaid = currentPaymentStatus === "paid"
  let snapToken = order.snap_token
  let paymentErrorMessage: string | null = null
  const isFailed = currentPaymentStatus === "failed"

  if (!isPaid && isFailed) {
    paymentErrorMessage = "Pembayaran gagal atau kedaluwarsa. Silakan buat pesanan baru."
  } else if (!isPaid && !snapToken) {
    try {
      const h = await headers()
      const origin =
        h.get("origin") ??
        `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`
      const finishUrl = `${origin}/order-success?order_id=${encodeURIComponent(order.id)}`

      const midtransResponse = await resolveSnapTokenForOrder({
        orderId: order.midtrans_order_id ?? order.order_number,
        grossAmount: order.gross_amount,
        customerName: order.customer_name ?? undefined,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone ?? undefined,
        finishUrl,
        existingSnapToken: order.snap_token,
        existingRedirectUrl: order.snap_redirect_url,
      })

      snapToken = midtransResponse.token
      await admin
        .from("orders")
        .update({
          midtrans_order_id: midtransResponse.midtransOrderId,
          snap_token: midtransResponse.token,
          snap_redirect_url: midtransResponse.redirect_url,
        })
        .eq("id", order.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat token pembayaran"
      if (message === "ORDER_ALREADY_PAID") {
        currentPaymentStatus = "paid"
        isPaid = true
      } else if (message.toLowerCase().includes("midtrans_server_key")) {
        paymentErrorMessage = "Konfigurasi Midtrans belum lengkap (Server Key belum diset)."
      } else if (message.toLowerCase().includes("midtrans api error: 401") || message.toLowerCase().includes("midtrans api error: 403")) {
        paymentErrorMessage = "Midtrans menolak request (401/403). Biasanya karena Server Key salah atau bukan Sandbox."
      } else {
        paymentErrorMessage = "Gagal membuat token pembayaran. Silakan coba lagi."
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-gradient-to-b from-muted/40 via-background to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex justify-center items-center">
        <OrderSuccessCard
          orderNumber={order.order_number}
          grossAmount={order.gross_amount}
          isPaid={isPaid}
          isFailed={isFailed && !snapToken}
          snapToken={snapToken}
          paymentErrorMessage={paymentErrorMessage}
        />
      </div>
    </div>
  )
}
