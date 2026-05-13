'use client'

import { useCartStore } from "@/store/use-cart-store"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckoutButton } from "@/components/checkout-button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { checkoutAction } from "@/lib/actions/checkout"

const SHIPPING_OPTIONS = [
  { value: "regular", label: "Reguler (2-4 hari)", cost: 20000 },
  { value: "express", label: "Express (1-2 hari)", cost: 40000 },
  { value: "pickup", label: "Ambil di Toko", cost: 0 },
] as const

export default function CheckoutClient() {
  const { items, getTotalPrice } = useCartStore()
  const [isLoaded, setIsLoaded] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<(typeof SHIPPING_OPTIONS)[number]["value"]>("regular")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-black uppercase mb-6">Keranjang Anda Kosong</h2>
        <Link href="/products" className="text-primary font-black uppercase underline decoration-4">Kembali Belanja</Link>
      </div>
    )
  }

  const total = getTotalPrice()
  const shippingCost = SHIPPING_OPTIONS.find((o) => o.value === shippingMethod)?.cost ?? 0
  const grandTotal = total + shippingCost

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">Checkout</h1>

      <form
        action={async (formData) => {
          const cartData = JSON.stringify(items)
          formData.append("cartData", cartData)

          useCartStore.getState().clearCart()
          await checkoutAction(formData)
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-12"
      >
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-4 border-foreground rounded-xl shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-white overflow-hidden">
            <CardHeader className="bg-foreground text-white border-b-4 border-foreground">
              <CardTitle className="text-xl font-black uppercase tracking-widest">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 py-6 border-b-4 border-foreground/5 last:border-0"
                >
                  <div className="relative w-24 h-24 border-4 border-foreground rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
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
                    <p className="text-lg font-black uppercase truncate">{item.name}</p>
                    <div className="text-sm font-bold text-muted-foreground space-y-1 mt-1">
                      {item.size && <p className="flex items-center gap-2">
                        <span className="bg-secondary px-2 py-0.5 border border-foreground/10 text-[10px] rounded-xl">SIZE</span> 
                        {item.size}
                      </p>}
                      {item.color && <p className="flex items-center gap-2">
                        <span className="bg-secondary px-2 py-0.5 border border-foreground/10 text-[10px] rounded-xl">COLOR</span>
                        {item.color}
                      </p>}
                      <p className="flex items-center gap-2">
                        <span className="bg-secondary px-2 py-0.5 border border-foreground/10 text-[10px] rounded-xl">QTY</span>
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center text-right">
                    <p className="text-xl font-black">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground rounded-xl shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-white overflow-hidden">
            <CardHeader className="bg-foreground text-white border-b-4 border-foreground">
              <CardTitle className="text-xl font-black uppercase tracking-widest">Pengiriman</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Pilih Ongkir
                </label>
                <select
                  name="shippingMethod"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value as any)}
                  className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                >
                  {SHIPPING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - Rp {opt.cost.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground font-bold italic">
                  Biaya ongkir ini contoh fixed-rate. Nanti bisa di-upgrade ke RajaOngkir/kurir real.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground rounded-xl shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-white overflow-hidden">
            <CardHeader className="bg-foreground text-white border-b-4 border-foreground">
              <CardTitle className="text-xl font-black uppercase tracking-widest">Data Penerima</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Nama
                  </label>
                  <input
                    name="customerName"
                    required
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                    placeholder="Nama penerima"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    No. HP / WhatsApp
                  </label>
                  <input
                    name="customerPhone"
                    required
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Alamat Pengiriman
                  </label>
                  <textarea
                    name="shippingAddress"
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                    placeholder="Nama jalan, nomor rumah, kecamatan, kota, provinsi, kode pos"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Catatan (opsional)
                  </label>
                  <textarea
                    name="note"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                    placeholder="Contoh: titip satpam / patokan rumah / warna packing"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-4 border-foreground rounded-xl shadow-[12px_12px_0_0_rgba(0,0,0,1)] bg-white sticky top-24">
            <CardHeader className="bg-primary text-white border-b-4 border-foreground">
              <CardTitle className="text-xl font-black uppercase tracking-widest text-center">Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-sm">Subtotal</span>
                <span className="font-black text-lg">Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-sm">Ongkir</span>
                <span className="font-black text-lg">Rp {shippingCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold uppercase tracking-wider text-sm">Pajak (0%)</span>
                <span className="font-black text-lg">Rp 0</span>
              </div>
              <div className="border-t-4 border-foreground pt-6 flex justify-between items-center">
                <span className="font-black uppercase tracking-tighter text-xl">Total Akhir</span>
                <span className="font-black text-3xl text-primary drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0">
              <div className="w-full">
                <CheckoutButton />
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
