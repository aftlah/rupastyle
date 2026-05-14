import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Profil - RupaStyle",
  description: "Profil toko RupaStyle",
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-black tracking-tight">Profil RupaStyle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            RupaStyle adalah e-commerce fashion Pria yang fokus pada pilihan outfit yang elegan, nyaman,
            dan relevan untuk kebutuhan harian maupun acara spesial.
          </p>
          <p>
            Kami kurasi produk dengan kualitas bahan yang baik, ukuran yang jelas, dan foto produk yang informatif
            agar pengalaman belanja Anda lebih tenang dan menyenangkan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

