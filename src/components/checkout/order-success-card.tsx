import Link from "next/link"
import { CheckCircle2, Clock3, Package, Sparkles, XCircle } from "lucide-react"
import PaymentButton from "@/components/checkout/payment-button"

interface OrderSuccessCardProps {
  orderNumber: string
  grossAmount: number
  isPaid: boolean
  isFailed: boolean
  snapToken: string | null
  paymentErrorMessage: string | null
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function OrderSuccessCard({
  orderNumber,
  grossAmount,
  isPaid,
  isFailed,
  snapToken,
  paymentErrorMessage,
}: OrderSuccessCardProps) {
  const status = isPaid ? "paid" : isFailed ? "failed" : "pending"

  const statusConfig = {
    paid: {
      icon: CheckCircle2,
      label: "Pembayaran Berhasil",
      title: "Terima kasih, pesanan Anda sudah kami terima",
      description: "Tim kami akan segera memproses pesanan Anda. Anda dapat memantau statusnya di halaman pesanan.",
      badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      iconClass: "bg-emerald-100 text-emerald-600",
      glowClass: "from-emerald-100/80 via-white to-emerald-50/40",
    },
    pending: {
      icon: Clock3,
      label: "Menunggu Pembayaran",
      title: "Pesanan berhasil dibuat",
      description: "Satu langkah lagi — selesaikan pembayaran untuk mengonfirmasi pesanan Anda.",
      badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
      iconClass: "bg-amber-100 text-amber-600",
      glowClass: "from-amber-100/70 via-white to-primary/5",
    },
    failed: {
      icon: XCircle,
      label: "Pembayaran Gagal",
      title: "Pesanan belum dapat diproses",
      description: paymentErrorMessage ?? "Pembayaran gagal atau kedaluwarsa. Silakan buat pesanan baru.",
      badgeClass: "bg-red-50 text-red-700 ring-red-200",
      iconClass: "bg-red-100 text-red-600",
      glowClass: "from-red-100/60 via-white to-red-50/30",
    },
  }[status]

  const StatusIcon = statusConfig.icon

  return (
    <div className="relative w-full max-w-xl">
      <div className={`absolute -inset-px rounded-[28px] bg-gradient-to-br ${statusConfig.glowClass} blur-sm`} />

      <div className="relative overflow-hidden rounded-[28px] border border-foreground/10 bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.18)]">
        <div className="px-8 pt-10 pb-8 text-center border-b border-foreground/5 bg-gradient-to-b from-white to-muted/20">
          <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${statusConfig.iconClass}`}>
            <StatusIcon className="h-8 w-8" strokeWidth={2.25} />
          </div>

          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ${statusConfig.badgeClass}`}>
            {status === "paid" ? <Sparkles className="h-3 w-3" /> : null}
            {statusConfig.label}
          </span>

          <h1 className="mt-5 text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight">
            {statusConfig.title}
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            {statusConfig.description}
          </p>
        </div>

        <div className="px-8 py-8 space-y-6">
          <div className="rounded-2xl border border-foreground/8 bg-muted/30 p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Nomor Pesanan
                </p>
                <p className="mt-1 font-black text-lg tracking-tight text-foreground">
                  {orderNumber}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-foreground/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
            </div>

            <div className="h-px bg-foreground/8" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Total Pembayaran
              </p>
              <p className="mt-1 text-3xl font-black text-primary tracking-tight">
                {formatRupiah(grossAmount)}
              </p>
            </div>
          </div>

          {!isPaid && !isFailed && snapToken ? (
            <div className="space-y-3">
              <PaymentButton snapToken={snapToken} variant="elegant" />
              <p className="text-center text-xs text-muted-foreground">
                Pembayaran aman melalui Midtrans Snap
              </p>
            </div>
          ) : null}

          {!isPaid && isFailed && !snapToken ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
              {paymentErrorMessage ?? "Token pembayaran tidak tersedia. Silakan hubungi admin."}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {isPaid ? (
              <Link
                href="/orders"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-wide hover:bg-primary/90 transition-colors"
              >
                Lihat Pesanan Saya
              </Link>
            ) : null}

            <Link
              href="/products"
              className={`inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-foreground/15 bg-white text-sm font-bold uppercase tracking-wide text-foreground hover:bg-muted/40 transition-colors ${!isPaid ? "sm:flex-1" : ""}`}
            >
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
