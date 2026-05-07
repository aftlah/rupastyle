import { getProducts } from "@/lib/products"
import ProductCard from "@/components/product-card"

export const metadata = {
  title: "Produk - RupaStyle",
  description: "Koleksi fashion wanita terbaik di RupaStyle",
}

export default async function ProductsPage() {
  const products = await getProducts()

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
