import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { deleteCategoryAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Button } from "@/components/ui/button"
import { Edit, Loader2, Plus, Trash2 } from "lucide-react"

type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  parent_category_id: string | null
  created_at: string
}

export const metadata = {
  title: "Categories - Admin | RupaStyle",
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error: errorMessage, message } = await searchParams
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_category_id, created_at")
    .order("name")

  if (error) throw error

  const rows = (data ?? []) as CategoryRow[]
  const byId = new Map(rows.map((c) => [c.id, c]))

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
          <h1 className="text-4xl font-black uppercase tracking-tight">Categories</h1>
          <p className="text-muted-foreground font-bold italic mt-1">
            Kelola kategori produk (mendukung nested)
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl inline-flex items-center justify-center"
        >
          <Plus size={24} className="mr-2" /> Add Category
        </Link>
      </div>

      <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-foreground text-white border-b-4 border-foreground">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Slug</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Parent</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground/10">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground font-bold italic">
                    Belum ada kategori
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-black uppercase text-sm">{c.name}</div>
                      {c.description ? (
                        <div className="text-xs text-muted-foreground font-bold line-clamp-1">{c.description}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold">{c.slug}</td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {c.parent_category_id ? byId.get(c.parent_category_id)?.name ?? "-" : "-"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-bold text-xs">
                      {new Date(c.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <div className="flex items-center gap-2">
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 border-2 border-foreground hover:bg-primary/20 hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all rounded-xl"
                            title="Edit"
                          >
                            <Link href={`/admin/categories/${c.id}`}>
                              <Edit size={18} />
                            </Link>
                          </Button>
                          <form action={deleteCategoryAction}>
                            <input type="hidden" name="categoryId" value={c.id} />
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
