import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { deleteBroadcastAction } from "@/lib/actions/admin"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, Loader2, Megaphone } from "lucide-react"

export const metadata = {
  title: "Siaran - Admin | RupaStyle",
}

export default async function AdminBroadcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error: errorMessage, message } = await searchParams
  const supabase = createAdminClient()

  const { data: broadcasts, error } = await supabase
    .from("broadcasts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error('Admin broadcasts error:', error.message, error.code)
    return (
      <div className="space-y-4 p-8 border-4 border-destructive bg-destructive/10 rounded-xl">
        <h1 className="text-2xl font-black uppercase text-destructive">Gagal memuat siaran</h1>
        <p className="font-bold text-sm">{error.message}</p>
        {error.code === '42501' ? (
          <p className="text-sm text-muted-foreground">
            Jalankan SQL fix di Supabase SQL Editor: <code className="font-mono">supabase/migrations/003_admin_grants.sql</code>
          </p>
        ) : null}
      </div>
    )
  }

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
          <h1 className="text-4xl font-black uppercase tracking-tight">Siaran</h1>
          <p className="text-muted-foreground font-bold italic mt-1">Promosikan produk dan informasi penting</p>
        </div>
        <Button asChild className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl">
          <Link href="/admin/broadcasts/new">
            <Plus size={24} className="mr-2" /> Buat Siaran
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {(broadcasts ?? []).map((broadcast) => (
          <div key={broadcast.id} className="bg-white border-4 border-foreground shadow-[6px_6px_0_0_rgba(0,0,0,1)] p-6 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 border-2 border-foreground bg-primary/10 flex items-center justify-center rounded-xl flex-shrink-0">
              <Megaphone size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-black uppercase">{broadcast.title}</h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border rounded-xl ${
                  broadcast.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {broadcast.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{broadcast.content}</p>
              {broadcast.link_url ? (
                <p className="text-xs font-mono text-primary mt-1">
                  → {broadcast.link_url.startsWith('/products/') ? 'Produk: ' : ''}{broadcast.link_url}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button asChild size="sm" variant="ghost" className="border-2 border-foreground rounded-xl">
                <Link href={`/admin/broadcasts/${broadcast.id}`}>
                  <Edit size={16} className="mr-1" /> Edit
                </Link>
              </Button>
              <form action={deleteBroadcastAction}>
                <input type="hidden" name="broadcastId" value={broadcast.id} />
                <FormSubmitButton
                  size="sm"
                  variant="ghost"
                  className="border-2 border-foreground text-red-600 rounded-xl"
                  pendingChildren={<Loader2 size={16} className="animate-spin" />}
                >
                  <Trash2 size={16} />
                </FormSubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>

      {(broadcasts ?? []).length === 0 ? (
        <div className="text-center py-16 border-2 border-foreground/10 border-dashed rounded-xl">
          <p className="text-muted-foreground font-bold italic">Belum ada siaran promosi</p>
        </div>
      ) : null}
    </div>
  )
}
