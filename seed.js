const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const env = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8')
const getEnv = (key) => {
  const match = env.match(new RegExp(`${key}=(.*)`))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseKey) {
  console.error("No service role key found")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  try {
    const categoriesToInsert = [
      { name: 'Atasan', slug: 'atasan', description: 'Koleksi atasan pria' },
      { name: 'Bawahan', slug: 'bawahan', description: 'Koleksi bawahan pria' },
    ]

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .upsert(categoriesToInsert, { onConflict: 'slug' })
      .select()

    if (catError) throw catError

    const atasanId = categories.find(c => c.slug === 'atasan')?.id
    const bawahanId = categories.find(c => c.slug === 'bawahan')?.id

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

    const { data: products, error: prodError } = await supabase
      .from('products')
      .upsert(productsToInsert, { onConflict: 'slug' })
      .select()

    if (prodError) throw prodError

    for (const product of products) {
      const { data: existingImages } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        
      if (existingImages && existingImages.length === 0) {
        let imageUrl = `https://placehold.co/600x600/black/white?text=${encodeURIComponent(product.name)}`
        await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: imageUrl,
            is_primary: true,
            order: 0
          })
      }
    }
    console.log("Success seeding data")
  } catch (err) {
    console.error(err)
  }
}

seed()
