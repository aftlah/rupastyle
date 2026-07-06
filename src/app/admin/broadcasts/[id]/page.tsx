import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateBroadcastAction } from "@/lib/actions/admin"
import { getProductsForBroadcastSelect } from "@/lib/products"
import BroadcastFormFields, { slugFromBroadcastLink } from "@/components/admin/broadcast-form-fields"
import { FormSubmitButton } from "@/components/form-submit-button"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function AdminEditBroadcastPage({ params, searchParams }: Props) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = createAdminClient()

  const [{ data: broadcast, error: broadcastError }, products] = await Promise.all([
    supabase.from("broadcasts").select("*").eq("id", id).single(),
    getProductsForBroadcastSelect(),
  ])

  if (broadcastError || !broadcast) notFound()

  return (
    <div className="space-y-8">
      {error ? (
        <div className="border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      ) : null}

      <header className="space-y-2">
        <Link href="/admin/broadcasts" className="inline-flex items-center gap-2 border-2 border-foreground bg-white px-4 py-2 font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] rounded-xl">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tight">Edit Siaran</h1>
      </header>

      <form action={updateBroadcastAction}>
        <input type="hidden" name="id" value={broadcast.id} />
        <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-6 rounded-xl max-w-2xl">
          <BroadcastFormFields
            products={products}
            defaultValues={{
              title: broadcast.title,
              content: broadcast.content,
              productSlug: slugFromBroadcastLink(broadcast.link_url),
              imageUrl: broadcast.image_url ?? '',
              isActive: broadcast.is_active,
            }}
          />
          <FormSubmitButton className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-xl">
            Simpan Perubahan
          </FormSubmitButton>
        </div>
      </form>
    </div>
  )
}
