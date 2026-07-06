import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateOrderShippingAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, Truck, Package } from "lucide-react"
import type { OrderItem } from "@/types"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function AdminOrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { error: errorMessage, message } = await searchParams
  const supabase = createAdminClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .single()

  if (error || !order) notFound()

  const items = (order.items ?? []) as OrderItem[]

  return (
    <div className="space-y-8">
      {errorMessage ? (
        <div className="border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      ) : null}
      {message ? (
        <div className="border-2 border-primary bg-primary/10 text-primary font-bold text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      ) : null}

      <header className="space-y-2">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-xl">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Order #{order.order_number}</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <Package size={20} /> Detail Pesanan
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground">Customer</p>
              <p className="font-bold">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.customer_email}</p>
              <p className="text-muted-foreground">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-muted-foreground">Status</p>
              <p className="font-bold uppercase">{order.status}</p>
              <p className="text-xs font-black uppercase text-muted-foreground mt-2">Pembayaran</p>
              <p className="font-bold uppercase">{order.payment_status}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-muted-foreground mb-1">Alamat Pengiriman</p>
            <pre className="text-sm whitespace-pre-wrap font-medium text-muted-foreground bg-muted/30 p-3 rounded-xl">{order.shipping_address}</pre>
          </div>
          {order.shipping_method ? (
            <p className="text-sm"><span className="font-black uppercase text-xs text-muted-foreground">Metode: </span>{order.shipping_method} — Ongkir {formatCurrency(Number(order.shipping_cost) || 0)}</p>
          ) : null}
          <p className="text-2xl font-black text-primary">Total: {formatCurrency(order.gross_amount)}</p>

          <div className="border-t-2 border-foreground/10 pt-4 space-y-2">
            <p className="text-xs font-black uppercase text-muted-foreground">Item Pesanan</p>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b border-foreground/5 pb-2">
                <div>
                  <p className="font-bold">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size ? `Ukuran: ${item.size}` : ""}{item.color ? ` | Warna: ${item.color}` : ""} × {item.quantity}
                  </p>
                </div>
                <p className="font-black">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-xl space-y-6">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            <Truck size={20} /> Proses Pengiriman
          </h2>

          <form action={updateOrderShippingAction} className="space-y-4">
            <input type="hidden" name="orderId" value={order.id} />

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status Pengiriman</label>
              <select
                name="status"
                defaultValue={order.status}
                className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl"
              >
                <option value="pending">Pending</option>
                <option value="processing">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="delivered">Terkirim</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nomor Resi</label>
              <input
                name="trackingNumber"
                defaultValue={order.tracking_number ?? ""}
                className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl"
                placeholder="JNE1234567890"
              />
            </div>

            {order.shipped_at ? (
              <p className="text-xs text-muted-foreground">Dikirim: {new Date(order.shipped_at).toLocaleString("id-ID")}</p>
            ) : null}
            {order.delivered_at ? (
              <p className="text-xs text-muted-foreground">Terkirim: {new Date(order.delivered_at).toLocaleString("id-ID")}</p>
            ) : null}

            <FormSubmitButton className="w-full h-14 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-xl">
              Update Pengiriman
            </FormSubmitButton>
          </form>
        </section>
      </div>
    </div>
  )
}
