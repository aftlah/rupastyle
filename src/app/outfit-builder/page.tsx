import { getProducts } from '@/lib/products'
import OutfitBuilderClient from './outfit-builder-client'

export const metadata = {
  title: 'Outfit Builder | Rupastyle',
  description: 'Mix and match your perfect outfit',
}

export default async function OutfitBuilderPage() {
  const products = await getProducts()
  
  // We filter on client to allow dynamic updates, but we can do a rough filter here
  // Assuming categories might have names like 'atasan', 'tops', 'bawahan', 'bottoms'
  const tops = products.filter(p => 
    p.category?.slug?.toLowerCase().includes('atasan') || 
    p.category?.name?.toLowerCase().includes('atasan') ||
    p.category?.name?.toLowerCase().includes('shirt')
  )
  
  const bottoms = products.filter(p => 
    p.category?.slug?.toLowerCase().includes('bawahan') || 
    p.category?.name?.toLowerCase().includes('bawahan') ||
    p.category?.name?.toLowerCase().includes('pants')
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-black uppercase tracking-tight mb-2 border-b-4 border-black pb-4">
        Outfit Builder
      </h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Pilih 1 atasan dan 1 bawahan untuk membuat kombinasi outfit terbaikmu.
      </p>
      
      <OutfitBuilderClient tops={tops} bottoms={bottoms} />
    </div>
  )
}
