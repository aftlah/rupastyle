import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"

export const metadata = {
  title: "Produk - RupaStyle",
  description: "Koleksi fashion wanita terbaik di RupaStyle",
}

export default async function ProductsPage() {
  const products = await getProducts()
  const groupedProducts = products.reduce<Record<string, typeof products>>((groups, product) => {
    const categoryName = product.category?.name?.trim() || "Tanpa Kategori"

    if (!groups[categoryName]) {
      groups[categoryName] = []
    }

    groups[categoryName].push(product)
    return groups
  }, {})
  const groupedEntries = Object.entries(groupedProducts)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Semua Produk</h1>
        <p className="text-muted-foreground">Temukan koleksi fashion wanita terbaru</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Belum ada produk tersedia</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedEntries.map(([categoryName, categoryProducts]) => (
            <section key={categoryName} className="space-y-6">
              <div className="border-b-2 border-foreground/10 pb-3">
                <h2 className="text-2xl font-black uppercase tracking-tight">{categoryName}</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  {categoryProducts.length} produk dalam kategori ini
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
