import { notFound } from "next/navigation"
import { getProductBySlug } from "@/lib/products"
import ProductImageGallery from "@/components/product-image-gallery"
import AddToCartForm from "@/components/product/add-to-cart-form"
import { formatCurrency, getProductPricing } from "@/lib/utils"

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
  const pricing = getProductPricing(product)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <ProductImageGallery images={images} />
        </div>

        <div className="space-y-6">
          <div>
            {product.category && (
              <p className="text-sm text-muted-foreground mb-2">{product.category.name}</p>
            )}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {pricing.hasPromo ? (
              <div className="space-y-2">
                {pricing.promoLabel ? (
                  <span className="inline-flex border-2 border-foreground bg-yellow-300 px-3 py-1 text-xs font-black uppercase rounded-xl">
                    {pricing.promoLabel}
                  </span>
                ) : null}
                <p className="text-lg font-bold text-muted-foreground line-through">
                  {formatCurrency(pricing.basePrice)}
                </p>
                <p className="text-3xl font-black text-primary">
                  {formatCurrency(pricing.finalPrice)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-primary">{formatCurrency(pricing.finalPrice)}</p>
            )}
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
