import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Semua Produk | RupaStyle',
  description: 'Lihat seluruh produk RupaStyle',
}

export default async function OutfitBuilderPage() {
  redirect('/products')
}
