import Link from "next/link"
import { createStoreAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Tambah Toko - Admin | RupaStyle",
}

export default async function AdminNewStorePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

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
          className="inline-flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Tambah Toko</h1>
      </header>

      <form action={createStoreAction}>
        <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-6 rounded-xl max-w-2xl">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Toko</label>
            <input name="name" required className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" placeholder="Urban Threads" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Slug</label>
            <input name="slug" required className="w-full h-12 px-4 border-2 border-foreground font-bold font-mono rounded-xl" placeholder="urban-threads" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Deskripsi</label>
            <textarea name="description" rows={4} className="w-full px-4 py-3 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alamat</label>
            <input name="address" className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Telepon</label>
            <input name="phone" className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logo URL (opsional)</label>
            <input name="logoUrl" type="url" className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl" />
          </div>
          <label className="flex items-center gap-3 border-2 border-foreground px-4 h-12 font-black uppercase rounded-xl w-fit">
            <input type="checkbox" name="isActive" defaultChecked className="h-5 w-5" />
            Aktif
          </label>
          <FormSubmitButton className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-xl">
            Simpan Toko
          </FormSubmitButton>
        </div>
      </form>
    </div>
  )
}
