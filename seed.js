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

const STORE_IMAGES = {
  'urban-threads': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
  'neo-streetwear': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=600&fit=crop',
  'classic-menswear': 'https://images.unsplash.com/photo-1490114538077-0a7f8ffc4981?w=600&h=600&fit=crop',
}

const PRODUCT_IMAGES = {
  'neo-tshirt-black': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
  'classic-white-shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
  'oversized-hoodie-grey': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop',
  'brutal-denim-pants': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop',
  'street-cargo-black': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop',
  'slim-chino-beige': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop',
  'linen-blazer-navy': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
  'polo-pique-white': 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=600&fit=crop',
  'wool-trouser-charcoal': 'https://images.unsplash.com/photo-1593030761757-71cae45d48e7?w=600&h=600&fit=crop',
}

async function seed() {
  try {
    const categoriesToInsert = [
      { name: 'Atasan', slug: 'atasan', description: 'Koleksi atasan pria — kaos, kemeja, hoodie, dan blazer' },
      { name: 'Bawahan', slug: 'bawahan', description: 'Koleksi bawahan pria — jeans, celana chino, dan wool trouser' },
    ]

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .upsert(categoriesToInsert, { onConflict: 'slug' })
      .select()

    if (catError) throw catError

    const atasanId = categories.find(c => c.slug === 'atasan')?.id
    const bawahanId = categories.find(c => c.slug === 'bawahan')?.id

    const storesToInsert = [
      {
        name: 'Urban Threads',
        slug: 'urban-threads',
        description: 'Toko streetwear urban dengan koleksi kaos dan hoodie berkualitas premium. Fokus pada desain modern dan bahan nyaman dipakai sehari-hari.',
        address: 'Jl. Kemang Raya No. 12, Jakarta Selatan',
        phone: '0812-3456-7890',
        logo_url: STORE_IMAGES['urban-threads'],
        is_active: true,
      },
      {
        name: 'Neo Streetwear',
        slug: 'neo-streetwear',
        description: 'Destinasi fashion street style dengan sentuhan neobrutalism. Menyediakan celana jeans, cargo, dan outerwear dengan potongan trendi.',
        address: 'Jl. Braga No. 45, Bandung',
        phone: '0813-9876-5432',
        logo_url: STORE_IMAGES['neo-streetwear'],
        is_active: true,
      },
      {
        name: 'Classic Menswear',
        slug: 'classic-menswear',
        description: 'Toko pakaian formal dan semi-formal pria. Koleksi kemeja, blazer, dan celana bahan untuk tampilan profesional dan elegan.',
        address: 'Jl. Sudirman No. 88, Surabaya',
        phone: '0811-2233-4455',
        logo_url: STORE_IMAGES['classic-menswear'],
        is_active: true,
      },
    ]

    const { data: stores, error: storeError } = await supabase
      .from('stores')
      .upsert(storesToInsert, { onConflict: 'slug' })
      .select()

    if (storeError) throw storeError

    const urbanId = stores.find(s => s.slug === 'urban-threads')?.id
    const neoId = stores.find(s => s.slug === 'neo-streetwear')?.id
    const classicId = stores.find(s => s.slug === 'classic-menswear')?.id

    const productsToInsert = [
      {
        name: 'Neo T-Shirt Black',
        slug: 'neo-tshirt-black',
        description: 'Kaos hitam premium dengan desain neobrutalism yang elegan. Bahan cotton combed 24s, breathable dan nyaman dipakai seharian. Jahitan double stitch untuk ketahanan maksimal. Cocok untuk gaya casual maupun street style.',
        price: 145000,
        stock: 120,
        category_id: atasanId,
        store_id: urbanId,
        is_active: true,
        is_featured: true,
        variants: {
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black'],
          sizePricing: { S: 145000, M: 155000, L: 165000, XL: 175000 },
        },
      },
      {
        name: 'Oversized Hoodie Grey',
        slug: 'oversized-hoodie-grey',
        description: 'Hoodie oversized abu-abu dengan bahan fleece tebal. Fit longgar memberikan kenyamanan maksimal, dilengkapi kantong kangaroo dan adjustable drawstring. Ideal untuk cuaca dingin dan gaya layered.',
        price: 285000,
        stock: 60,
        category_id: atasanId,
        store_id: urbanId,
        is_active: true,
        is_featured: true,
        variants: {
          sizes: ['M', 'L', 'XL'],
          colors: ['Grey'],
          sizePricing: { M: 285000, L: 295000, XL: 310000 },
        },
      },
      {
        name: 'Classic White Shirt',
        slug: 'classic-white-shirt',
        description: 'Kemeja putih lengan panjang berbahan katun premium. Potongan slim fit yang rapi, kerah klasik, dan kancing mutiara. Cocok untuk acara formal, kantor, maupun smart casual.',
        price: 245000,
        stock: 50,
        category_id: atasanId,
        store_id: classicId,
        is_active: true,
        is_featured: true,
        variants: {
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['White'],
          sizePricing: { S: 245000, M: 255000, L: 265000, XL: 280000 },
        },
      },
      {
        name: 'Linen Blazer Navy',
        slug: 'linen-blazer-navy',
        description: 'Blazer linen navy dengan potongan tailored modern. Bahan linen ringan dan breathable, sempurna untuk cuaca tropis. Dilengkapi 2 kancing dan 2 saku depan. Tampil profesional tanpa kesan kaku.',
        price: 520000,
        stock: 25,
        category_id: atasanId,
        store_id: classicId,
        is_active: true,
        is_featured: false,
        variants: {
          sizes: ['M', 'L', 'XL'],
          colors: ['Navy'],
          sizePricing: { M: 520000, L: 540000, XL: 560000 },
        },
      },
      {
        name: 'Polo Pique White',
        slug: 'polo-pique-white',
        description: 'Polo shirt putih bahan pique cotton dengan kerah berlapis. Jahitan rapi, breathable, dan mudah dirawat. Cocok untuk golf, kantor casual, atau weekend outing.',
        price: 195000,
        stock: 80,
        category_id: atasanId,
        store_id: classicId,
        is_active: true,
        is_featured: false,
        variants: {
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['White'],
          sizePricing: { S: 195000, M: 205000, L: 215000, XL: 225000 },
        },
      },
      {
        name: 'Brutal Denim Pants',
        slug: 'brutal-denim-pants',
        description: 'Celana jeans biru dengan potongan relaxed fit. Denim 12oz berkualitas tinggi, warna wash natural yang timeless. Dilengkapi 5 pocket klasik dan kancing logam branded.',
        price: 340000,
        stock: 75,
        category_id: bawahanId,
        store_id: neoId,
        is_active: true,
        is_featured: true,
        variants: {
          sizes: ['30', '32', '34', '36'],
          colors: ['Blue'],
          sizePricing: { '30': 340000, '32': 350000, '34': 360000, '36': 375000 },
        },
      },
      {
        name: 'Street Cargo Black',
        slug: 'street-cargo-black',
        description: 'Celana cargo hitam dengan 6 kantong fungsional. Bahan ripstop tahan lama, tali adjustable di pinggang, dan potongan tapered untuk siluet modern. Perfect untuk street style dan outdoor casual.',
        price: 315000,
        stock: 80,
        category_id: bawahanId,
        store_id: neoId,
        is_active: true,
        is_featured: false,
        variants: {
          sizes: ['30', '32', '34', '36'],
          colors: ['Black'],
          sizePricing: { '30': 315000, '32': 325000, '34': 335000, '36': 350000 },
        },
      },
      {
        name: 'Slim Chino Beige',
        slug: 'slim-chino-beige',
        description: 'Celana chino beige slim fit dari bahan stretch cotton. Nyaman dipakai seharian, mudah dipadukan dengan berbagai atasan. Warna beige netral cocok untuk smart casual.',
        price: 275000,
        stock: 55,
        category_id: bawahanId,
        store_id: urbanId,
        is_active: true,
        is_featured: false,
        variants: {
          sizes: ['30', '32', '34', '36'],
          colors: ['Beige'],
          sizePricing: { '30': 275000, '32': 285000, '34': 295000, '36': 310000 },
        },
      },
      {
        name: 'Wool Trouser Charcoal',
        slug: 'wool-trouser-charcoal',
        description: 'Celana bahan wool blend charcoal dengan potongan straight leg. Bahan halus, tidak mudah kusut, dan memberikan tampilan formal yang elegan. Dilengkapi hook & bar closure.',
        price: 420000,
        stock: 35,
        category_id: bawahanId,
        store_id: classicId,
        is_active: true,
        is_featured: false,
        variants: {
          sizes: ['30', '32', '34', '36'],
          colors: ['Charcoal'],
          sizePricing: { '30': 420000, '32': 430000, '34': 440000, '36': 455000 },
        },
      },
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
        const imageUrl = PRODUCT_IMAGES[product.slug] ||
          `https://placehold.co/600x600/black/white?text=${encodeURIComponent(product.name)}`

        await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: imageUrl,
            is_primary: true,
            order: 0,
          })
      }
    }

    const broadcastsToInsert = [
      {
        title: 'Grand Opening — Diskon 15% Semua Produk!',
        content: 'Rayakan peluncuran 3 toko baru RupaStyle! Dapatkan diskon 15% untuk semua produk pilihan selama periode promo. Buruan checkout sebelum kehabisan!',
        link_url: '/products',
        is_active: true,
      },
      {
        title: 'Koleksi Streetwear Terbaru dari Neo Streetwear',
        content: 'Celana jeans dan cargo terbaru sudah tersedia. Setiap ukuran punya harga berbeda — pilih yang pas untuk gaya lo!',
        link_url: '/products',
        is_active: true,
      },
      {
        title: 'Gratis Ongkir Ambil di Toko',
        content: 'Pilih metode "Ambil di Toko" saat checkout dan nikmati gratis ongkir. Tersedia di 3 lokasi: Jakarta, Bandung, dan Surabaya.',
        link_url: '/how-to-buy',
        is_active: true,
      },
    ]

    const { error: broadcastError } = await supabase
      .from('broadcasts')
      .upsert(broadcastsToInsert, { onConflict: 'title' })

    if (broadcastError && !broadcastError.message.includes('duplicate')) {
      const { error: insertBroadcastError } = await supabase
        .from('broadcasts')
        .insert(broadcastsToInsert)

      if (insertBroadcastError) {
        console.warn('Broadcast seed warning:', insertBroadcastError.message)
      }
    }

    console.log('Success seeding data:')
    console.log(`  - ${stores.length} toko`)
    console.log(`  - ${products.length} produk`)
    console.log(`  - ${broadcastsToInsert.length} siaran`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

seed()
