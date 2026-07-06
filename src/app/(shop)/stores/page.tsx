import Link from 'next/link'
import Image from 'next/image'
import { getStores } from '@/lib/stores'

export const metadata = {
  title: 'Toko - RupaStyle',
  description: 'Jelajahi toko-toko partner RupaStyle',
}

export default async function StoresPage() {
  const stores = await getStores()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase mb-2">Toko Partner</h1>
        <p className="text-muted-foreground font-medium">Belanja langsung dari toko favorit lo</p>
      </header>

      {stores.length === 0 ? (
        <p className="font-bold text-muted-foreground">Belum ada toko aktif.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="border-4 border-foreground bg-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl overflow-hidden hover:-translate-y-1 transition-transform"
            >
              <div className="relative h-48 bg-muted">
                {store.logo_url ? (
                  <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-black uppercase">{store.name}</h2>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{store.description}</p>
                {store.address ? (
                  <p className="text-xs font-bold mt-3 text-muted-foreground">{store.address}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
