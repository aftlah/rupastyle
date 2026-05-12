import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Cara Pembelian - RupaStyle",
  description: "Panduan cara belanja di RupaStyle",
}

export default function HowToBuyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-black tracking-tight">Cara Pembelian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Pilih produk yang Anda inginkan dari halaman Produk.</li>
            <li>Atur varian (ukuran/warna) dan jumlah, lalu klik Add to Cart.</li>
            <li>Periksa keranjang, lalu lanjut ke Checkout.</li>
            <li>Klik Bayar Sekarang untuk menyelesaikan pembayaran.</li>
          </ol>
          <p>
            Jika membutuhkan bantuan, silakan gunakan tombol Chat WhatsApp di kanan bawah.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

