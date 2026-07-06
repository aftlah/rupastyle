import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { deleteStoreAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Loader2, Store } from "lucide-react"

export const metadata = {
  title: "Toko - Admin | RupaStyle",
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error: errorMessage, message } = await searchParams
  const supabase = createAdminClient()

  const { data: stores, error } = await supabase
    .from("stores")
    .select("*")
    .order("name")

  if (error) throw error

  return (
    <div className="space-y-8">
      {errorMessage ? (
        <div className="border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      ) : null}
      {message ? (
        <div className="border-2 border-primary bg-primary/10 text-primary font-bold text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Toko</h1>
          <p className="text-muted-foreground font-bold italic mt-1">Kelola toko dan vendor produk</p>
        </div>
        <Button asChild className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl">
          <Link href="/admin/stores/new">
            <Plus size={24} className="mr-2" /> Tambah Toko
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(stores ?? []).map((store) => (
          <div key={store.id} className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 border-2 border-foreground bg-primary/10 flex items-center justify-center rounded-xl flex-shrink-0">
                <Store size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-black uppercase text-lg">{store.name}</h2>
                <p className="text-xs text-muted-foreground font-mono">{store.slug}</p>
                <span className={`inline-block mt-2 text-[10px] font-black uppercase px-2 py-1 border rounded-xl ${
                  store.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {store.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
            {store.description ? (
              <p className="text-sm text-muted-foreground line-clamp-2">{store.description}</p>
            ) : null}
            {store.address ? (
              <p className="text-xs font-bold text-muted-foreground">{store.address}</p>
            ) : null}
            <div className="flex items-center gap-2 pt-2">
              <Button asChild size="sm" variant="ghost" className="border-2 border-foreground rounded-xl">
                <Link href={`/admin/stores/${store.id}`}>
                  <Edit size={16} className="mr-1" /> Edit
                </Link>
              </Button>
              <form action={deleteStoreAction}>
                <input type="hidden" name="storeId" value={store.id} />
                <FormSubmitButton
                  size="sm"
                  variant="ghost"
                  className="border-2 border-foreground text-red-600 rounded-xl"
                  pendingChildren={<Loader2 size={16} className="animate-spin" />}
                >
                  <Trash2 size={16} className="mr-1" /> Hapus
                </FormSubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      {(stores ?? []).length === 0 ? (
        <div className="text-center py-16 border-2 border-foreground/10 border-dashed rounded-xl">
          <p className="text-muted-foreground font-bold italic">Belum ada toko. Tambahkan minimal 3 toko.</p>
        </div>
      ) : null}
    </div>
  )
}
