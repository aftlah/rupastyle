import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { formatCurrency, getProductPricing } from "@/lib/utils"
import { FormSubmitButton } from "@/components/form-submit-button"
import AdminProductsFilters from "@/components/admin/admin-products-filters"
import Link from "next/link"
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { deleteProductAction } from "@/lib/actions/admin"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; q?: string; category?: string; status?: string }>
}) {
  const { error: errorMessage, message, q, category, status } = await searchParams
  const supabase = await createClient()
  const searchQuery = (q ?? "").trim().toLowerCase()
  const selectedCategory = (category ?? "").trim().toLowerCase()
  const selectedStatus = (status ?? "").trim().toLowerCase()
  
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      images:product_images(*)
    `)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true })

  const filteredProducts = (products ?? []).filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery) ||
      product.slug?.toLowerCase().includes(searchQuery) ||
      product.id?.toLowerCase().includes(searchQuery)

    const productCategory = product.category?.name?.trim().toLowerCase() || "uncategorized"
    const matchesCategory =
      !selectedCategory ||
      (selectedCategory === "uncategorized" ? !product.category?.name : productCategory === selectedCategory)

    const productStatus = product.is_active ? "active" : "draft"
    const matchesStatus = !selectedStatus || productStatus === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-8">
      {typeof errorMessage === "string" && errorMessage ? (
        <div className="border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      ) : null}
      {typeof message === "string" && message ? (
        <div className="border-2 border-primary bg-primary/10 text-primary font-bold text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground font-bold italic mt-1">Manage items, prices, and stock inventory</p>
        </div>
        <Button asChild className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl">
          <Link href="/admin/products/new">
            <Plus size={24} className="mr-2" /> Add New Product
          </Link>
        </Button>
      </div>

      {/* Filters Bar */}
      <AdminProductsFilters
        initialQuery={q ?? ""}
        initialCategory={category ?? ""}
        initialStatus={status ?? ""}
        totalProducts={(products ?? []).length}
        filteredCount={filteredProducts.length}
        categories={categories ?? []}
      />

      {/* Product Table */}
      <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-foreground text-white border-b-4 border-foreground">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground/10">
              {filteredProducts.map((product) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                const pricing = getProductPricing(product as any)
                return (
                  <tr key={product.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgba(0,0,0,0.1)] flex-shrink-0 overflow-hidden rounded-xl">
                          {primaryImage ? (
                            <Image 
                              src={primaryImage.image_url} 
                              alt={product.name} 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black uppercase text-sm line-clamp-1">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold font-mono">ID: {product.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black uppercase bg-muted px-2 py-1 border border-foreground/10 rounded-xl">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-sm">
                      {pricing.hasPromo ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-muted-foreground line-through">
                            {formatCurrency(pricing.basePrice)}
                          </p>
                          <p>{formatCurrency(pricing.finalPrice)}</p>
                        </div>
                      ) : (
                        formatCurrency(product.price)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                        <span className="font-black text-sm">{product.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 border-2 border-foreground rounded-xl ${
                        product.is_active ? 'bg-green-400' : 'bg-red-400'
                      }`}>
                        {product.is_active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button asChild size="icon" variant="ghost" className="h-10 w-10 border-2 border-foreground hover:bg-primary/20 hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all rounded-xl">
                          <Link href={`/admin/products/${product.id}`}>
                            <Edit size={18} />
                          </Link>
                        </Button>
                        <form action={deleteProductAction}>
                          <input type="hidden" name="productId" value={product.id} />
                          <FormSubmitButton
                            className="h-10 w-10 border-2 border-foreground hover:bg-red-500 hover:text-white hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all rounded-xl text-red-600"
                            title="Hapus"
                            size="icon"
                            variant="ghost"
                            pendingChildren={<Loader2 size={18} className="animate-spin" />}
                          >
                            <Trash2 size={18} />
                          </FormSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="px-6 py-12 text-center border-t-2 border-foreground/10">
            <p className="font-black uppercase text-lg">Produk tidak ditemukan</p>
            <p className="text-sm text-muted-foreground font-bold mt-2">
              Coba ubah kata kunci pencarian atau reset filter kategori dan status.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
