import Image from "next/image"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { setProductPromoAction } from "@/lib/actions/admin"
import { formatCurrency, getProductPricing } from "@/lib/utils"
import { FormSubmitButton } from "@/components/form-submit-button"

export const metadata = {
  title: "Promos - Admin | RupaStyle",
}

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error: errorMessage, message } = await searchParams
  const supabase = createAdminClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("*, category:categories(name), images:product_images(*)")
    .order("created_at", { ascending: false })

  if (error) throw error

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

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">Manual Promos</h1>
          <p className="text-muted-foreground font-bold italic mt-1">
            Atur promo per produk dengan persentase diskon. Harga promo dihitung otomatis dari harga asli.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="h-12 px-6 border-2 border-foreground bg-white text-foreground font-black uppercase text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl inline-flex items-center justify-center"
        >
          Kembali ke Produk
        </Link>
      </header>

      <section className="bg-white border-4 border-foreground shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-foreground text-white border-b-4 border-foreground">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Produk</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Harga Normal</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Promo Aktif</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest">Set Promo</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground/10">
              {(products ?? []).map((product) => {
                const primaryImage = product.images?.find((img: { is_primary: boolean }) => img.is_primary) || product.images?.[0]
                const pricing = getProductPricing(product)
                return (
                  <tr key={product.id} className="align-top hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4 min-w-[280px]">
                        <div className="relative w-16 h-16 border-2 border-foreground bg-background overflow-hidden rounded-xl">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black uppercase text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground font-bold">
                            {product.category?.name || "Uncategorized"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black text-sm whitespace-nowrap">
                      {formatCurrency(Number(product.price) || 0)}
                    </td>
                    <td className="px-6 py-5 min-w-[220px]">
                      {pricing.hasPromo ? (
                        <div className="space-y-1">
                          {pricing.promoLabel ? (
                            <span className="inline-flex text-[10px] font-black uppercase px-2 py-1 border-2 border-foreground bg-yellow-300 rounded-xl">
                              {pricing.promoLabel}
                            </span>
                          ) : null}
                          <p className="text-xs font-bold text-muted-foreground line-through">
                            {formatCurrency(pricing.basePrice)}
                          </p>
                          <p className="font-black text-primary">{formatCurrency(pricing.finalPrice)}</p>
                        </div>
                      ) : (
                        <span className="text-xs font-bold uppercase text-muted-foreground">Belum ada promo</span>
                      )}
                    </td>
                    <td className="px-6 py-5 min-w-[320px]">
                      <form action={setProductPromoAction} className="space-y-3">
                        <input type="hidden" name="productId" value={product.id} />
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Persen Promo
                          </label>
                          <input
                            name="promoPercent"
                            type="number"
                            max={99}
                            min={0}
                            defaultValue={pricing.promoPercent ?? ""}
                            placeholder="Contoh: 20"
                            className="w-full h-11 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Label Promo
                          </label>
                          <input
                            name="promoLabel"
                            defaultValue={pricing.promoLabel ?? ""}
                            placeholder="Contoh: Flash Sale"
                            className="w-full h-11 px-4 border-2 border-foreground font-bold focus:bg-primary/5 outline-none transition-all rounded-xl"
                          />
                        </div>
                        {pricing.hasPromo ? (
                          <p className="text-xs font-bold text-muted-foreground">
                            Harga setelah promo: {formatCurrency(pricing.finalPrice)} ({pricing.discountPercent}%)
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-muted-foreground">
                            Isi persen promo, lalu sistem akan menghitung harga akhirnya otomatis.
                          </p>
                        )}
                        <div className="flex gap-3">
                          <FormSubmitButton className="h-11 px-5 border-2 border-foreground bg-primary text-white font-black uppercase text-xs shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl">
                            Simpan Promo
                          </FormSubmitButton>
                          {pricing.hasPromo ? (
                            <button
                              type="submit"
                              name="promoPercent"
                              value=""
                              className="h-11 px-5 border-2 border-foreground bg-white text-foreground font-black uppercase text-xs shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl"
                            >
                              Hapus Promo
                            </button>
                          ) : null}
                        </div>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
