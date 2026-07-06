import Link from "next/link"
import { createBroadcastAction } from "@/lib/actions/admin"
import { getProductsForBroadcastSelect } from "@/lib/products"
import BroadcastFormFields from "@/components/admin/broadcast-form-fields"
import { FormSubmitButton } from "@/components/form-submit-button"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Buat Siaran - Admin | RupaStyle",
}

export default async function AdminNewBroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const products = await getProductsForBroadcastSelect()

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
        <h1 className="text-4xl font-black uppercase tracking-tight">Buat Siaran</h1>
      </header>

      <form action={createBroadcastAction}>
        <div className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8 space-y-6 rounded-xl max-w-2xl">
          <BroadcastFormFields products={products} />
          <FormSubmitButton className="h-14 px-8 border-4 border-foreground bg-primary text-white font-black uppercase text-lg shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-xl">
            Publikasikan Siaran
          </FormSubmitButton>
        </div>
      </form>
    </div>
  )
}
