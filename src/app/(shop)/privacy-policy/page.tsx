import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Kebijakan Privasi - RupaStyle",
  description: "Kebijakan privasi RupaStyle",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Card className="border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-black tracking-tight">Kebijakan Privasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Kami menghargai privasi Anda. Informasi yang Anda berikan digunakan untuk memproses pesanan,
            meningkatkan layanan, dan komunikasi terkait transaksi.
          </p>
          <p>
            Kami tidak menjual data pribadi Anda kepada pihak lain. Data dapat dibagikan kepada penyedia layanan
            yang diperlukan untuk pembayaran dan operasional, sesuai kebutuhan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

