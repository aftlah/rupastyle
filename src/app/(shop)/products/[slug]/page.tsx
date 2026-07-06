import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/products"
import ProductImageGallery from "@/components/product-image-gallery"
import AddToCartForm from "@/components/product/add-to-cart-form"
import ProductPriceDisplay from "@/components/product/product-price-display"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    return {
      title: "Produk Tidak Ditemukan - RupaStyle",
    }
  }
  
  return {
    title: `${product.name} - RupaStyle`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const images = product.images || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <ProductImageGallery images={images} />
        </div>

        <div className="space-y-6">
          <div>
            {product.store && (
              <p className="text-sm font-black uppercase text-primary mb-1">{product.store.name}</p>
            )}
            {product.category && (
              <p className="text-sm text-muted-foreground mb-2">{product.category.name}</p>
            )}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {product.is_featured && (
              <span className="inline-flex border-2 border-foreground bg-primary text-white text-xs font-black uppercase px-3 py-1 rounded-xl mb-3">
                Produk Pilihan
              </span>
            )}
            <ProductPriceDisplay product={product} />
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  )
}
