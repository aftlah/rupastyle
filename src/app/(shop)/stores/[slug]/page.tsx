import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getStoreBySlug } from '@/lib/stores'
import { getProductsByStoreSlug } from '@/lib/products'
import ProductCard from '@/components/product-card'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const store = await getStoreBySlug(slug)
  return { title: store ? `${store.name} - RupaStyle` : 'Toko - RupaStyle' }
}

export default async function StoreDetailPage({ params }: Props) {
  const { slug } = await params
  const store = await getStoreBySlug(slug)

  if (!store) notFound()

  const products = await getProductsByStoreSlug(slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/stores" className="text-sm font-black uppercase text-primary hover:underline">
        ← Semua Toko
      </Link>

      <header className="mt-6 mb-10 border-4 border-foreground bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl overflow-hidden">
        {store.logo_url ? (
          <div className="relative h-56 bg-muted">
            <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
          </div>
        ) : null}
        <div className="p-8">
          <h1 className="text-4xl font-black uppercase">{store.name}</h1>
          {store.description ? (
            <p className="text-muted-foreground font-medium mt-3 max-w-3xl">{store.description}</p>
          ) : null}
          <div className="mt-4 text-sm font-bold text-muted-foreground space-y-1">
            {store.address ? <p>📍 {store.address}</p> : null}
            {store.phone ? <p>📞 {store.phone}</p> : null}
          </div>
        </div>
      </header>

      <h2 className="text-2xl font-black uppercase mb-6">Produk dari {store.name}</h2>

      {products.length === 0 ? (
        <p className="font-bold text-muted-foreground">Belum ada produk dari toko ini.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
