import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createAdminClient } from "@/lib/supabase/admin"
import { updateCategoryAction } from "@/lib/actions/admin"

export const metadata = {
  title: "Edit Category - Admin | RupaStyle",
}

type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  parent_category_id: string | null
}

export default async function AdminEditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error: errorMessage } = await searchParams
  const supabase = createAdminClient()

  const [{ data: category, error: categoryError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, parent_category_id")
        .eq("id", id)
        .single(),
      supabase.from("categories").select("id, name").order("name"),
    ])

  if (categoryError) {
    notFound()
  }
  if (categoriesError) {
    throw categoriesError
  }

  const current = category as CategoryRow
  const parentOptions = (categories ?? []).filter((c: any) => c.id !== id)

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
        <h1 className="text-4xl font-black uppercase tracking-tight">Edit Category</h1>
        <p className="text-muted-foreground font-bold italic">
          Update informasi kategori produk
        </p>
        {typeof errorMessage === "string" && errorMessage ? (
          <div className="border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm px-4 py-3 rounded-xl">
            {errorMessage}
          </div>
        ) : null}
      </header>

      <form action={updateCategoryAction}>
        <input type="hidden" name="id" value={current.id} />
        <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-6 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Nama Kategori
              </label>
              <input
                name="name"
                required
                defaultValue={current.name}
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
                defaultValue={current.slug}
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all font-mono rounded-xl"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Deskripsi (opsional)
              </label>
              <textarea
                name="description"
                rows={4}
                defaultValue={current.description ?? ""}
                className="w-full px-4 py-3 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Parent (opsional)
              </label>
              <select
                name="parentCategoryId"
                className="w-full h-12 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                defaultValue={current.parent_category_id ?? ""}
              >
                <option value="">Tidak ada (root)</option>
                {parentOptions.map((c: any) => (
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
            <button
              type="submit"
              className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

