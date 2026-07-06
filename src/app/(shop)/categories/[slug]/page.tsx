import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategoryBySlug, getProductsByCategorySlug } from '@/lib/products'
import ProductCard from '@/components/product-card'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  return {
    title: category ? `${category.name} - RupaStyle` : 'Kategori - RupaStyle',
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) notFound()

  const products = await getProductsByCategorySlug(slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/products" className="text-sm font-black uppercase text-primary hover:underline">
          ← Semua Produk
        </Link>
        <h1 className="text-4xl font-black uppercase mt-4">{category.name}</h1>
        {category.description ? (
          <p className="text-muted-foreground font-medium mt-2">{category.description}</p>
        ) : null}
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground font-bold">Belum ada produk di kategori ini.</p>
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
