import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Syarat & Ketentuan - RupaStyle",
  description: "Syarat dan ketentuan penggunaan layanan RupaStyle",
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-black tracking-tight">Syarat & Ketentuan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Dengan menggunakan layanan RupaStyle, Anda setuju untuk memberikan informasi yang benar saat bertransaksi
            serta mematuhi aturan yang berlaku.
          </p>
          <p>
            Ketersediaan stok dapat berubah. Kami berhak membatalkan pesanan jika terjadi kendala sistem atau stok,
            dan akan menginformasikan kepada Anda melalui kanal komunikasi yang tersedia.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

