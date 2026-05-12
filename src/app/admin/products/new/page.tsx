import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { createProductAction } from "@/lib/actions/admin"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Add Product - Admin | RupaStyle",
}

export default async function AdminNewProductPage() {
  const supabase = createAdminClient()

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  if (error) throw error

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tight">Add Product</h1>
          <p className="text-muted-foreground font-bold italic">
            Tambahkan produk baru untuk katalog RupaStyle
          </p>
        </div>
      </header>

      <form action={createProductAction}>
        <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Nama Produk
              </label>
              <input
                name="name"
                required
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all"
                placeholder="Contoh: Midi Dress Satin"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Slug
              </label>
              <input
                name="slug"
                required
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all font-mono"
                placeholder="contoh: midi-dress-satin"
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
                className="w-full px-4 py-3 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all"
                placeholder="Deskripsi singkat produk..."
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
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all"
                placeholder="Contoh: 279000"
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
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all"
                placeholder="Contoh: 25"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Kategori
              </label>
              <select
                name="categoryId"
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all"
                defaultValue=""
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
              <label className="flex items-center gap-3 border-2 border-foreground px-4 h-12 font-black uppercase">
                <input type="checkbox" name="isActive" defaultChecked className="h-5 w-5" />
                Active
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Sizes (comma separated)
              </label>
              <input
                name="sizes"
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all"
                placeholder="S, M, L"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Colors (comma separated)
              </label>
              <input
                name="colors"
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all"
                placeholder="Black, White"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Foto Utama (opsional)
              </label>
              <input
                name="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="w-full border-2 border-foreground p-3 font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              href="/admin/products"
              className="h-14 px-8 border-4 border-foreground bg-white text-foreground font-black uppercase text-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-none inline-flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-none"
            >
              Save Product
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
