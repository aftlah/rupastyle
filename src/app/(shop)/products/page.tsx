import { Suspense } from 'react'
import { getFilteredProducts, getCategories, type ProductFilters, type ProductSort } from '@/lib/products'
import ProductCard from '@/components/product-card'
import ProductFiltersBar from '@/components/shop/product-filters-bar'

export const metadata = {
  title: "Produk - RupaStyle",
  description: "Koleksi fashion pria terbaik di RupaStyle",
}

interface Props {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
  }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const filters: ProductFilters = {
    q: params.q,
    category: params.category,
    sort: (params.sort as ProductSort | undefined) ?? 'newest',
  }

  const [products, categories] = await Promise.all([
    getFilteredProducts(filters),
    getCategories(),
  ])

  const featuredProducts = products.filter((p) => p.is_featured)
  const showFeatured = !params.q && !params.category

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase mb-2">Semua Produk</h1>
        <p className="text-muted-foreground font-medium">Temukan koleksi fashion pria terbaru</p>
      </div>

      <Suspense fallback={null}>
        <ProductFiltersBar categories={categories as any} total={products.length} />
      </Suspense>

      {products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-foreground/20 rounded-xl">
          <p className="text-muted-foreground font-bold">Tidak ada produk yang cocok dengan filter.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {showFeatured && featuredProducts.length > 0 ? (
            <section className="space-y-6">
              <h2 className="text-2xl font-black uppercase text-primary">Produk Pilihan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-6">
            {!showFeatured ? (
              <h2 className="text-2xl font-black uppercase">Hasil Pencarian</h2>
            ) : (
              <h2 className="text-2xl font-black uppercase">Katalog</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(showFeatured ? products.filter((p) => !p.is_featured) : products).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
