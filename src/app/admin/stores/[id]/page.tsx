import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateStoreAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Edit Toko - Admin | RupaStyle",
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function AdminEditStorePage({ params, searchParams }: Props) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = createAdminClient()

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single()

  if (storeError || !store) notFound()

  return (
    <div className="space-y-8">
      {error ? (
        <div className="border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      ) : null}

      <header className="space-y-2">
        <Link
          href="/admin/stores"
          className="inline-flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-xl"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Edit Toko</h1>
      </header>

      <form action={updateStoreAction}>
        <input type="hidden" name="id" value={store.id} />
        <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-6 rounded-xl max-w-2xl">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Toko</label>
            <input name="name" required defaultValue={store.name} className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Slug</label>
            <input name="slug" required defaultValue={store.slug} className="w-full h-12 px-4 border-2 border-foreground font-bold font-mono rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Deskripsi</label>
            <textarea name="description" rows={4} defaultValue={store.description ?? ""} className="w-full px-4 py-3 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alamat</label>
            <input name="address" defaultValue={store.address ?? ""} className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Telepon</label>
            <input name="phone" defaultValue={store.phone ?? ""} className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logo URL</label>
            <input name="logoUrl" type="url" defaultValue={store.logo_url ?? ""} className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <label className="flex items-center gap-3 border-2 border-foreground px-4 h-12 font-black uppercase rounded-xl w-fit">
            <input type="checkbox" name="isActive" defaultChecked={store.is_active} className="h-5 w-5" />
            Aktif
          </label>
          <FormSubmitButton className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-xl">
            Simpan Perubahan
          </FormSubmitButton>
        </div>
      </form>
    </div>
  )
}
