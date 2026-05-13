import { getProducts } from '@/lib/products'
import OutfitBuilderClient from './outfit-builder-client'

export const metadata = {
  title: 'Outfit Builder | RupaStyle',
  description: 'Mix and match your perfect outfit',
}

export default async function OutfitBuilderPage() {
  const products = await getProducts()
  
  // Filter products for Tops and Bottoms
  const tops = products.filter(p => 
    p.category?.slug === 'atasan' || 
    p.category?.name?.toLowerCase().includes('atasan')
  )
  
  const bottoms = products.filter(p => 
    p.category?.slug === 'bawahan' || 
    p.category?.name?.toLowerCase().includes('bawahan')
  )

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-block border-2 border-foreground bg-white px-6 py-2 mb-6 transform rotate-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl">
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Interactive Tool</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-4">
            Outfit <span className="text-primary">Builder</span>
          </h1>
          <p className="text-muted-foreground text-xl font-medium">
            Gabungkan atasan dan bawahan favorit lo untuk melihat bagaimana mereka terlihat saat dipakai bersamaan.
          </p>
        </header>
        
        <OutfitBuilderClient tops={tops} bottoms={bottoms} />
      </div>
    </div>
  )
}
