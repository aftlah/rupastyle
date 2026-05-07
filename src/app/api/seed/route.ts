import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // 1. Create Categories
    const categoriesToInsert = [
      { name: 'Atasan', slug: 'atasan', description: 'Koleksi atasan pria' },
      { name: 'Bawahan', slug: 'bawahan', description: 'Koleksi bawahan pria' },
    ]

    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .upsert(categoriesToInsert, { onConflict: 'slug' })
      .select()

    if (catError) throw catError

    const atasanId = categories.find(c => c.slug === 'atasan')?.id
    const bawahanId = categories.find(c => c.slug === 'bawahan')?.id

    // 2. Create Products
    const productsToInsert = [
      {
        name: 'Neo T-Shirt Black',
        slug: 'neo-tshirt-black',
        description: 'T-shirt hitam dengan desain neobrutalism yang elegan.',
        price: 150000,
        stock: 100,
        category_id: atasanId,
        is_active: true,
        variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'] }
      },
      {
        name: 'Classic White Shirt',
        slug: 'classic-white-shirt',
        description: 'Kemeja putih lengan panjang berbahan katun.',
        price: 250000,
        stock: 50,
        category_id: atasanId,
        is_active: true,
        variants: { sizes: ['M', 'L', 'XL'], colors: ['White'] }
      },
      {
        name: 'Brutal Denim Pants',
        slug: 'brutal-denim-pants',
        description: 'Celana jeans biru dengan potongan relax.',
        price: 350000,
        stock: 75,
        category_id: bawahanId,
        is_active: true,
        variants: { sizes: ['30', '32', '34', '36'], colors: ['Blue'] }
      },
      {
        name: 'Street Cargo Black',
        slug: 'street-cargo-black',
        description: 'Celana cargo hitam dengan banyak kantong fungsional.',
        price: 320000,
        stock: 80,
        category_id: bawahanId,
        is_active: true,
        variants: { sizes: ['30', '32', '34'], colors: ['Black'] }
      }
    ]

    const { data: products, error: prodError } = await supabaseAdmin
      .from('products')
      .upsert(productsToInsert, { onConflict: 'slug' })
      .select()

    if (prodError) throw prodError

    // 3. Create Product Images
    // Use picsum or placehold.co for dummy images
    for (const product of products) {
      // check if images exist first
      const { data: existingImages } = await supabaseAdmin
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        
      if (existingImages && existingImages.length === 0) {
        let imageUrl = `https://placehold.co/600x600/black/white?text=${encodeURIComponent(product.name)}`
        
        await supabaseAdmin
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: imageUrl,
            is_primary: true,
            order: 0
          })
      }
    }

    return NextResponse.json({ message: 'Seed data inserted successfully', categories, products })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
  }
}
