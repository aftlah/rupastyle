import { getOutfitBuilderProducts } from '@/lib/products'
import OutfitBuilderClient from './outfit-builder-client'

export const metadata = {
  title: 'Outfit Builder - RupaStyle',
  description: 'Mix & match atasan dan bawahan untuk gaya maksimal',
}

export default async function OutfitBuilderPage() {
  const { tops, bottoms } = await getOutfitBuilderProducts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
          Outfit <span className="text-primary">Builder</span>
        </h1>
        <p className="text-muted-foreground font-bold max-w-2xl">
          Pilih kombinasi atasan dan bawahan terbaik. Fitur eksklusif RupaStyle untuk tampil maksimal.
        </p>
      </header>

      {tops.length === 0 || bottoms.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-foreground/20 rounded-xl">
          <p className="font-bold text-muted-foreground">
            Produk atasan/bawahan belum tersedia. Jalankan seed database terlebih dahulu.
          </p>
        </div>
      ) : (
        <OutfitBuilderClient tops={tops} bottoms={bottoms} />
      )}
    </div>
  )
}
