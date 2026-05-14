import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatCurrency } from "@/lib/utils"

type AdminOrderRow = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  gross_amount: number
  status: string
  payment_status: string
  created_at: string
}

export const metadata = {
  title: "Orders - Admin | RupaStyle",
}

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, gross_amount, status, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    throw error
  }

  const rows = (orders ?? []) as AdminOrderRow[]

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Orders</h1>
          <p className="text-muted-foreground font-bold italic mt-1">Kelola pesanan pelanggan</p>
        </div>
        <Link
          href="/"
          className="text-xs font-black uppercase hover:text-primary transition-colors border-2 border-foreground px-4 py-2 bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-xl"
        >
          View Site
        </Link>
      </header>

      <section className="bg-white border-4 border-foreground p-6 shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Latest Orders</h2>
          <div className="text-xs font-black uppercase text-muted-foreground tracking-widest">
            Showing {rows.length}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-16 border-2 border-foreground/10 border-dashed rounded-xl">
            <p className="text-muted-foreground font-bold italic">Belum ada order</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b-2 border-foreground/10">
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Order</th>
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Customer</th>
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Total</th>
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Payment</th>
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Status</th>
                  <th className="py-3 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="border-b border-foreground/10 hover:bg-primary/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-black uppercase">#{order.order_number}</div>
                      <div className="text-xs text-muted-foreground font-bold">{order.id}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="font-bold">{order.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                    </td>
                    <td className="py-4 pr-4 font-black">{formatCurrency(order.gross_amount)}</td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase border border-foreground rounded-xl">
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase border border-foreground rounded-xl">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-muted-foreground font-bold">
                      {new Date(order.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
