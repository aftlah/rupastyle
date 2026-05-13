import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createAdminClient } from "@/lib/supabase/admin"
import { updateProductAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"

export const metadata = {
  title: "Edit Product - Admin | RupaStyle",
}

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: product, error: productError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("id", id)
        .single(),
      supabase.from("categories").select("id, name").order("name"),
    ])

  if (productError) {
    notFound()
  }
  if (categoriesError) {
    throw categoriesError
  }

  const sizes = product.variants?.sizes?.join(", ") ?? ""
  const colors = product.variants?.colors?.join(", ") ?? ""
  const images = (product.images ?? []) as Array<{
    id: string
    image_url: string
    is_primary: boolean
  }>

  const primaryImage = images.find((i) => i.is_primary) ?? images[0]

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3">
        <Link
          href="/admin/products"
          className="inline-flex w-fit items-center gap-2 border-2 border-foreground bg-white px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground font-bold italic mt-1">
            Update data produk dan upload foto (opsional)
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <form action={updateProductAction}>
            <input type="hidden" name="id" value={product.id} />

            <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-8 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Nama Produk
                  </label>
                  <input
                    name="name"
                    required
                    defaultValue={product.name}
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Slug
                  </label>
                  <input
                    name="slug"
                    required
                    defaultValue={product.slug}
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all font-mono rounded-xl"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={5}
                    defaultValue={product.description ?? ""}
                    className="w-full px-4 py-3 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Harga (IDR)
                  </label>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    required
                    defaultValue={product.price}
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Stock
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    required
                    defaultValue={product.stock}
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Kategori
                  </label>
                  <select
                    name="categoryId"
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                    defaultValue={product.category_id ?? ""}
                  >
                    <option value="">Uncategorized</option>
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    href="/admin/categories/new"
                    className="inline-block text-xs font-black uppercase underline decoration-4 underline-offset-4 text-primary"
                  >
                    + Tambah kategori
                  </Link>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Status
                  </label>
                  <label className="flex items-center gap-3 border-2 border-foreground px-4 h-12 font-black uppercase rounded-xl">
                    <input type="checkbox" name="isActive" defaultChecked={Boolean(product.is_active)} className="h-5 w-5" />
                    Active
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Sizes (comma separated)
                  </label>
                  <input
                    name="sizes"
                    defaultValue={sizes}
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                    placeholder="S, M, L"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Colors (comma separated)
                  </label>
                  <input
                    name="colors"
                    defaultValue={colors}
                    className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                    placeholder="Black, White"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Tambah Foto (opsional)
                  </label>
                  <input
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="w-full border-2 border-foreground p-3 font-bold rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground font-bold">
                    Foto akan disimpan ke Supabase Storage bucket product-images.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Link
                  href="/admin/products"
                  className="h-14 px-8 border-4 border-foreground bg-white text-foreground font-black uppercase text-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl inline-flex items-center justify-center"
                >
                  Cancel
                </Link>
                <FormSubmitButton className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-primary/90 hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl">
                  Save Changes
                </FormSubmitButton>
              </div>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-xl">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
              Preview
            </p>
            <div className="relative w-full aspect-square border-2 border-foreground bg-background overflow-hidden rounded-xl">
              {primaryImage ? (
                <Image
                  src={primaryImage.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold uppercase tracking-widest">
                  No Image
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="font-black uppercase">{product.name}</p>
              <p className="text-xs text-muted-foreground font-bold font-mono">
                ID: {product.id}
              </p>
            </div>
          </div>

          <div className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-xl">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
              Images ({images.length})
            </p>
            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground font-bold italic">Belum ada gambar</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square border-2 border-foreground bg-background overflow-hidden rounded-xl"
                    title={img.is_primary ? "Primary" : "Image"}
                  >
                    <Image
                      src={img.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    {img.is_primary ? (
                      <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black uppercase px-2 py-1 border-2 border-foreground rounded-xl">
                        Primary
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
