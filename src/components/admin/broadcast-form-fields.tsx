import type { Product } from '@/types'

type ProductOption = Pick<Product, 'id' | 'name' | 'slug'>

interface BroadcastFormFieldsProps {
  products: ProductOption[]
  defaultValues?: {
    title?: string
    content?: string
    productSlug?: string
    imageUrl?: string
    isActive?: boolean
  }
}

export function slugFromBroadcastLink(linkUrl?: string | null) {
  if (!linkUrl) return ''
  const match = linkUrl.match(/^\/products\/([^/?#]+)/)
  return match?.[1] ?? ''
}

export default function BroadcastFormFields({ products, defaultValues }: BroadcastFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Judul</label>
        <input
          name="title"
          required
          defaultValue={defaultValues?.title ?? ''}
          className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl"
          placeholder="Diskon 20% Neo T-Shirt Black!"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Konten</label>
        <textarea
          name="content"
          required
          rows={4}
          defaultValue={defaultValues?.content ?? ''}
          className="w-full px-4 py-3 border-2 border-foreground font-bold rounded-xl"
          placeholder="Jelaskan promo atau informasi..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Produk Tujuan
        </label>
        <select
          name="productSlug"
          defaultValue={defaultValues?.productSlug ?? ''}
          className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl bg-white"
        >
          <option value="">— Tidak link ke produk —</option>
          {products.map((product) => (
            <option key={product.id} value={product.slug}>
              {product.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground font-medium">
          Jika dipilih, tombol &quot;Lihat Produk&quot; di homepage akan menuju halaman produk tersebut.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Gambar URL (opsional)
        </label>
        <input
          name="imageUrl"
          type="url"
          defaultValue={defaultValues?.imageUrl ?? ''}
          className="w-full h-12 px-4 border-2 border-foreground font-bold rounded-xl"
          placeholder="https://..."
        />
      </div>

      <label className="flex items-center gap-3 border-2 border-foreground px-4 h-12 font-black uppercase rounded-xl w-fit">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaultValues?.isActive ?? true}
          className="h-5 w-5"
        />
        Aktif
      </label>
    </>
  )
}
