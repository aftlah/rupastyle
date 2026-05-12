import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Kontak - RupaStyle",
  description: "Hubungi RupaStyle",
}

export default function ContactPage() {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "")
  const href = number ? `https://wa.me/${number}` : "https://wa.me/"

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-black tracking-tight">Kontak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Jika Anda butuh bantuan terkait produk, ukuran, atau status pesanan, silakan hubungi kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="w-full sm:w-auto">
              <Link href={href} target="_blank" rel="noopener noreferrer">
                Chat WhatsApp
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/how-to-buy">Cara Pembelian</Link>
            </Button>
          </div>
          {!number && (
            <p className="text-sm">
              WhatsApp belum dikonfigurasi. Set env NEXT_PUBLIC_WHATSAPP_NUMBER.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

