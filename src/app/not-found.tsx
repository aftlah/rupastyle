import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan | RupaStyle",
  description: "Halaman yang Anda cari tidak ditemukan.",
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-xl border border-border shadow-sm">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-fit rounded-full border border-border bg-muted px-4 py-2">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Error 404
            </span>
          </div>
          <CardTitle className="text-3xl md:text-4xl font-black tracking-tight">
            Halaman Tidak Ditemukan
          </CardTitle>
          <p className="text-muted-foreground">
            Link mungkin sudah berubah, dihapus, atau Anda salah mengetik alamat.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-bold text-foreground">Saran cepat:</p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Cek kembali URL yang Anda masukkan.</li>
              <li>Kembali ke halaman utama atau lihat katalog produk.</li>
              <li>Gunakan navigasi di atas untuk berpindah halaman.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="w-full">
            <Link href="/">Kembali ke Home</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/products">Lihat Produk</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

