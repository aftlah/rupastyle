import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { createCategoryAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"
import { ProductNameSlugFields } from "@/components/admin/product-name-slug-fields"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Add Category - Admin | RupaStyle",
}

export default async function AdminNewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const errorMessage = typeof params.error === "string" ? params.error : null

  const supabase = createAdminClient()
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  if (error) throw error

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Add Category</h1>
        <p className="text-muted-foreground font-bold italic">
          Buat kategori baru untuk produk
        </p>
        {errorMessage ? (
          <div className="border-2 border-red-600 bg-red-50 px-4 py-3 font-bold text-sm text-red-700 rounded-xl">
            {errorMessage}
          </div>
        ) : null}
      </header>

      <form action={createCategoryAction}>
        <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductNameSlugFields
              nameLabel="Nama Kategori"
              namePlaceholder="Contoh: Dress"
              slugPlaceholder="contoh: dress"
            />

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Deskripsi (opsional)
              </label>
              <textarea
                name="description"
                rows={4}
                className="w-full px-4 py-3 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                placeholder="Deskripsi kategori..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Parent (opsional)
              </label>
              <select
                name="parentCategoryId"
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                defaultValue=""
              >
                <option value="">Tidak ada (root)</option>
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              href="/admin/categories"
              className="h-14 px-8 border-4 border-foreground bg-white text-foreground font-black uppercase text-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl inline-flex items-center justify-center"
            >
              Cancel
            </Link>
            <FormSubmitButton className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:bg-primary/90 hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl">
              Save Category
            </FormSubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}
