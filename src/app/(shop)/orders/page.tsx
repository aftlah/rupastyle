import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { Package, Truck } from "lucide-react"
import type { OrderItem } from "@/types"

export const metadata = {
  title: "Pesanan Saya - RupaStyle",
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Menunggu",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Terkirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  }
  return labels[status] ?? status
}

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Pesanan Saya</h1>
        <p className="text-muted-foreground">Lacak status pembayaran dan pengiriman pesananmu</p>
      </div>

      {(orders ?? []).length === 0 ? (
        <div className="text-center py-16 border-2 border-foreground border-dashed rounded-xl">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="font-bold text-muted-foreground">Belum ada pesanan</p>
          <Link href="/products" className="inline-block mt-4 font-black uppercase text-sm border-2 border-foreground px-6 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const items = (order.items ?? []) as OrderItem[]
            return (
              <div key={order.id} className="bg-white border-4 border-foreground shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-6 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-black uppercase">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black uppercase px-3 py-1 border-2 border-foreground rounded-xl bg-yellow-100">
                      Bayar: {order.payment_status}
                    </span>
                    <span className="text-[10px] font-black uppercase px-3 py-1 border-2 border-foreground rounded-xl bg-blue-100">
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} {item.size ? `(${item.size})` : ""} × {item.quantity}</span>
                      <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-foreground/10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="font-black text-primary text-lg">{formatCurrency(order.gross_amount)}</p>
                  {order.tracking_number ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck size={16} />
                      <span className="font-bold">Resi: {order.tracking_number}</span>
                    </div>
                  ) : null}
                </div>

                {order.payment_status === "pending" ? (
                  <Link
                    href={`/order-success?order_id=${order.id}`}
                    className="inline-block text-xs font-black uppercase border-2 border-foreground px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors"
                  >
                    Lanjutkan Pembayaran
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
