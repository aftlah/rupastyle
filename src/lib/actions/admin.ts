'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient, ensureProductImagesBucket } from '@/lib/supabase/admin'
import { parseSizePricingInput } from '@/lib/utils'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()
    
  if (!profile?.is_admin) return redirect('/')
  return user
}

export async function upsertProduct(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const categoryId = (formData.get('categoryId') as string) || null
  const storeId = (formData.get('storeId') as string) || null
  const isActive = formData.get('isActive') === 'on'
  const isFeatured = formData.get('isFeatured') === 'on'
  const sizes = formData.get('sizes')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []
  const colors = formData.get('colors')?.toString().split(',').map(c => c.trim()).filter(Boolean) || []
  const sizePricingRaw = (formData.get('sizePricing') as string | null) ?? ''
  const sizePricing = parseSizePricingInput(sizePricingRaw)
  const imageFile = formData.get('image') as File | null
  let existingPromo: { price?: number | null; percent?: number | null; label?: string | null } | undefined

  if (id) {
    const { data: existingProduct } = await supabase
      .from('products')
      .select('variants')
      .eq('id', id)
      .single()

    existingPromo = (existingProduct as { variants?: { promo?: { price?: number | null; percent?: number | null; label?: string | null } } } | null)
      ?.variants?.promo
  }

  const productData = {
    name,
    slug,
    description,
    price,
    stock,
    category_id: categoryId,
    store_id: storeId,
    is_active: isActive,
    is_featured: isFeatured,
    variants: existingPromo
      ? { sizes, colors, ...(Object.keys(sizePricing).length > 0 ? { sizePricing } : {}), promo: existingPromo }
      : { sizes, colors, ...(Object.keys(sizePricing).length > 0 ? { sizePricing } : {}) },
    updated_at: new Date().toISOString(),
  }

  let productId = id

  if (id) {
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
    if (error) throw error
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...productData, created_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    productId = data.id
  }

  if (productId && imageFile && imageFile.size > 0) {
    await ensureProductImagesBucket()
    const admin = createAdminClient()

    const fileExt = imageFile.name.split('.').pop() || 'jpg'
    const filePath = `${productId}/${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await admin.storage
      .from('product-images')
      .upload(filePath, imageFile, { upsert: false })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = admin.storage
      .from('product-images')
      .getPublicUrl(filePath)

    const { data: existingImages, error: existingError } = await admin
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .limit(1)

    if (existingError) throw existingError

    const { error: imageInsertError } = await admin
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: publicUrl,
        is_primary: (existingImages?.length ?? 0) === 0,
      })

    if (imageInsertError) throw imageInsertError
  }

  revalidatePath('/admin/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/products')
  revalidatePath('/')
  
  return { success: true, productId }
}

export async function createProductAction(formData: FormData) {
  await upsertProduct(formData)
  redirect('/admin/products')
}

export async function updateProductAction(formData: FormData) {
  await upsertProduct(formData)
  redirect('/admin/products')
}

export async function setProductPromoAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const productId = (formData.get("productId") as string | null)?.trim() ?? ""
  const promoLabel = ((formData.get("promoLabel") as string | null) ?? "").trim()
  const promoPercentRaw = ((formData.get("promoPercent") as string | null) ?? "").trim()

  if (!productId) {
    redirect("/admin/promos?error=Produk%20tidak%20valid")
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug, price, variants")
    .eq("id", productId)
    .single()

  if (productError || !product) {
    redirect("/admin/promos?error=Produk%20tidak%20ditemukan")
  }

  const currentVariants =
    (product as { variants?: { sizes?: string[]; colors?: string[]; promo?: { price?: number | null; percent?: number | null; label?: string | null } } })
      .variants ?? {}

  let nextVariants: typeof currentVariants = {
    ...currentVariants,
  }

  if (!promoPercentRaw) {
    if ("promo" in nextVariants) {
      delete nextVariants.promo
    }
  } else {
    const promoPercent = Number(promoPercentRaw)
    if (!Number.isFinite(promoPercent) || promoPercent <= 0) {
      redirect("/admin/promos?error=Persen%20promo%20harus%20lebih%20besar%20dari%200")
    }
    if (promoPercent >= 100) {
      redirect("/admin/promos?error=Persen%20promo%20harus%20lebih%20kecil%20dari%20100")
    }

    nextVariants = {
      ...nextVariants,
      promo: {
        percent: promoPercent,
        price: null,
        label: promoLabel || null,
      },
    }
  }

  const { error } = await supabase
    .from("products")
    .update({
      variants: nextVariants,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)

  if (error) {
    redirect(`/admin/promos?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/admin/promos")
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
  revalidatePath(`/products/${product.slug}`)
  revalidatePath("/products")
  revalidatePath("/")

  if (!promoPercentRaw) {
    redirect("/admin/promos?message=Promo%20berhasil%20dihapus")
  }

  redirect("/admin/promos?message=Promo%20berhasil%20disimpan")
}

export async function createCategoryAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const name = (formData.get("name") as string) || ""
  const slug = (formData.get("slug") as string) || ""
  const description = (formData.get("description") as string) || null
  const parentCategoryId = (formData.get("parentCategoryId") as string) || null

  if (!name.trim() || !slug.trim()) {
    redirect("/admin/categories/new?error=Nama%20dan%20slug%20wajib")
  }

  const { error } = await supabase
    .from("categories")
    .insert({
      name: name.trim(),
      slug: slug.trim(),
      description: description ? description.toString().trim() : null,
      parent_category_id: parentCategoryId,
    })

  if (error) {
    const message = (() => {
      const raw = (error as { message: string })?.message?.toString?.() || "Gagal menyimpan kategori"
      const lower = raw.toLowerCase()
      if (lower.includes("row-level security") || lower.includes("rls")) {
        return "Gagal menyimpan kategori (RLS). Tambahkan policy INSERT untuk admin di tabel categories."
      }
      if ((error as { code: string })?.code === "23505" || lower.includes("duplicate key")) {
        return "Slug sudah digunakan. Gunakan slug lain yang unik."
      }
      return raw
    })()
    redirect(`/admin/categories/new?error=${encodeURIComponent(message)}`)
  }

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function updateCategoryAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const id = (formData.get("id") as string) || ""
  const name = (formData.get("name") as string) || ""
  const slug = (formData.get("slug") as string) || ""
  const description = (formData.get("description") as string) || null
  const parentCategoryId = (formData.get("parentCategoryId") as string) || null

  if (!id.trim()) {
    redirect("/admin/categories?error=Category%20ID%20tidak%20valid")
  }
  if (!name.trim() || !slug.trim()) {
    redirect(`/admin/categories/${encodeURIComponent(id)}?error=Nama%20dan%20slug%20wajib`)
  }
  if (parentCategoryId && parentCategoryId === id) {
    redirect(`/admin/categories/${encodeURIComponent(id)}?error=Parent%20tidak%20boleh%20diri%20sendiri`)
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      slug: slug.trim(),
      description: description ? description.toString().trim() : null,
      parent_category_id: parentCategoryId || null,
    })
    .eq("id", id)

  if (error) {
    const message = (() => {
      const raw = (error as { message: string })?.message?.toString?.() || "Gagal update kategori"
      const lower = raw.toLowerCase()
      if ((error as { code: string })?.code === "23505" || lower.includes("duplicate key")) {
        return "Slug sudah digunakan. Gunakan slug lain yang unik."
      }
      return raw
    })()
    redirect(`/admin/categories/${encodeURIComponent(id)}?error=${encodeURIComponent(message)}`)
  }

  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/")
  redirect("/admin/categories?message=Kategori%20berhasil%20diupdate")
}

export async function deleteCategoryAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const categoryId = (formData.get("categoryId") as string | null) ?? ""
  if (!categoryId.trim()) {
    redirect("/admin/categories?error=Category%20ID%20tidak%20valid")
  }

  const [{ data: child }, { data: product }] = await Promise.all([
    supabase
      .from("categories")
      .select("id")
      .eq("parent_category_id", categoryId)
      .limit(1),
    supabase
      .from("products")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1),
  ])

  if ((child?.length ?? 0) > 0) {
    redirect("/admin/categories?error=Kategori%20punya%20sub-kategori.%20Hapus%20sub-kategori%20dulu.")
  }
  if ((product?.length ?? 0) > 0) {
    redirect("/admin/categories?error=Kategori%20masih%20dipakai%20produk.%20Pindahkan%20produk%20dulu.")
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId)
  if (error) {
    redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/")
  redirect("/admin/categories?message=Kategori%20berhasil%20dihapus")
}

function getStoragePathFromPublicUrl(url: string) {
  try {
    const u = new URL(url)
    const marker = "/storage/v1/object/public/product-images/"
    const index = u.pathname.indexOf(marker)
    if (index < 0) return null
    const after = u.pathname.slice(index + marker.length)
    return decodeURIComponent(after).replace(/^\/+/, "")
  } catch {
    return null
  }
}

export async function deleteProductAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const productId = (formData.get("productId") as string | null) ?? ""
  if (!productId.trim()) {
    redirect("/admin/products?error=Product%20ID%20tidak%20valid")
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId)

  if (images && images.length > 0) {
    const paths = images
      .map((i: { image_url: string }) => getStoragePathFromPublicUrl(i.image_url))
      .filter(Boolean) as string[]

    if (paths.length > 0) {
      await supabase.storage.from("product-images").remove(paths)
    } else {
      const { data: listed } = await supabase.storage
        .from("product-images")
        .list(productId, { limit: 100 })
      const listedPaths =
        (listed ?? []).map((o) => `${productId}/${o.name}`).filter(Boolean) || []
      if (listedPaths.length > 0) {
        await supabase.storage.from("product-images").remove(listedPaths)
      }
    }
  } else {
    const { data: listed } = await supabase.storage
      .from("product-images")
      .list(productId, { limit: 100 })
    const listedPaths =
      (listed ?? []).map((o) => `${productId}/${o.name}`).filter(Boolean) || []
    if (listedPaths.length > 0) {
      await supabase.storage.from("product-images").remove(listedPaths)
    }
  }

  await supabase.from("cart_items").delete().eq("product_id", productId)
  await supabase.from("product_images").delete().eq("product_id", productId)

  const { error } = await supabase.from("products").delete().eq("id", productId)
  if (error) {
    const message = error.message.toLowerCase().includes("foreign key")
      ? "Produk tidak bisa dihapus karena sudah dipakai (mis. ada order). Nonaktifkan produk saja."
      : error.message
    redirect(`/admin/products?error=${encodeURIComponent(message)}`)
  }

  revalidatePath("/admin/products")
  revalidatePath("/")
  redirect("/admin/products?message=Produk%20berhasil%20dihapus")
}

export async function uploadProductImage(productId: string, file: File) {
  await checkAdmin()
  await ensureProductImagesBucket()
  const supabase = createAdminClient()

  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}/${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  // Add to product_images table
  const { error: dbError } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      image_url: publicUrl,
      is_primary: false, // Default to false, can be updated later
    })

  if (dbError) throw dbError

  revalidatePath('/admin/products')
  return { success: true, url: publicUrl }
}

export async function setUserRoleAction(formData: FormData) {
  const user = await checkAdmin()
  const supabase = createAdminClient()

  const userId = (formData.get("userId") as string | null) ?? ""
  const role = (formData.get("role") as string | null) ?? ""

  if (!userId.trim()) {
    redirect("/admin/users?error=User%20ID%20tidak%20valid")
  }
  if (userId === user.id) {
    redirect("/admin/users?error=Tidak%20bisa%20mengubah%20role%20diri%20sendiri")
  }

  const isAdmin = role === "admin"
  if (role !== "admin" && role !== "user") {
    redirect("/admin/users?error=Role%20tidak%20valid")
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, is_admin: isAdmin }, { onConflict: "id" })

  if (error) throw error

  revalidatePath("/admin/users")
  redirect("/admin/users?message=Role%20berhasil%20diupdate")
}

export async function setUserPasswordAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const userId = (formData.get("userId") as string | null) ?? ""
  const password = (formData.get("password") as string | null) ?? ""

  if (!userId.trim()) {
    redirect("/admin/users?error=User%20ID%20tidak%20valid")
  }
  if (password.trim().length < 8) {
    redirect("/admin/users?error=Password%20minimal%208%20karakter")
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: password.trim(),
  })

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath("/admin/users")
  redirect("/admin/users?message=Password%20berhasil%20diubah")
}

export async function createStoreAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const name = (formData.get('name') as string) || ''
  const slug = (formData.get('slug') as string) || ''
  const description = (formData.get('description') as string) || null
  const address = (formData.get('address') as string) || null
  const phone = (formData.get('phone') as string) || null
  const logoUrl = (formData.get('logoUrl') as string) || null
  const isActive = formData.get('isActive') === 'on'

  if (!name.trim() || !slug.trim()) {
    redirect('/admin/stores/new?error=Nama%20dan%20slug%20wajib')
  }

  const { error } = await supabase.from('stores').insert({
    name: name.trim(),
    slug: slug.trim(),
    description: description?.trim() || null,
    address: address?.trim() || null,
    phone: phone?.trim() || null,
    logo_url: logoUrl?.trim() || null,
    is_active: isActive,
  })

  if (error) {
    redirect(`/admin/stores/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/stores')
  revalidatePath('/products')
  redirect('/admin/stores?message=Toko%20berhasil%20ditambahkan')
}

export async function updateStoreAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const id = (formData.get('id') as string) || ''
  const name = (formData.get('name') as string) || ''
  const slug = (formData.get('slug') as string) || ''
  const description = (formData.get('description') as string) || null
  const address = (formData.get('address') as string) || null
  const phone = (formData.get('phone') as string) || null
  const logoUrl = (formData.get('logoUrl') as string) || null
  const isActive = formData.get('isActive') === 'on'

  if (!id.trim()) {
    redirect('/admin/stores?error=Store%20ID%20tidak%20valid')
  }

  const { error } = await supabase
    .from('stores')
    .update({
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      address: address?.trim() || null,
      phone: phone?.trim() || null,
      logo_url: logoUrl?.trim() || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    redirect(`/admin/stores/${encodeURIComponent(id)}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/stores')
  revalidatePath('/products')
  redirect('/admin/stores?message=Toko%20berhasil%20diupdate')
}

export async function deleteStoreAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const storeId = (formData.get('storeId') as string | null) ?? ''
  if (!storeId.trim()) {
    redirect('/admin/stores?error=Store%20ID%20tidak%20valid')
  }

  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('store_id', storeId)
    .limit(1)

  if ((products?.length ?? 0) > 0) {
    redirect('/admin/stores?error=Toko%20masih%20punya%20produk.%20Pindahkan%20produk%20dulu.')
  }

  const { error } = await supabase.from('stores').delete().eq('id', storeId)
  if (error) {
    redirect(`/admin/stores?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/stores')
  redirect('/admin/stores?message=Toko%20berhasil%20dihapus')
}

async function resolveBroadcastLinkFromForm(formData: FormData) {
  const productSlug = (formData.get('productSlug') as string | null)?.trim() ?? ''
  if (productSlug) {
    return `/products/${productSlug}`
  }
  return null
}

export async function createBroadcastAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const title = (formData.get('title') as string) || ''
  const content = (formData.get('content') as string) || ''
  const linkUrl = await resolveBroadcastLinkFromForm(formData)
  const imageUrl = (formData.get('imageUrl') as string) || null
  const isActive = formData.get('isActive') === 'on'

  if (!title.trim() || !content.trim()) {
    redirect('/admin/broadcasts/new?error=Judul%20dan%20konten%20wajib')
  }

  const { error } = await supabase.from('broadcasts').insert({
    title: title.trim(),
    content: content.trim(),
    link_url: linkUrl?.trim() || null,
    image_url: imageUrl?.trim() || null,
    is_active: isActive,
  })

  if (error) {
    redirect(`/admin/broadcasts/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/broadcasts')
  revalidatePath('/')
  redirect('/admin/broadcasts?message=Siaran%20berhasil%20ditambahkan')
}

export async function updateBroadcastAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const id = (formData.get('id') as string) || ''
  const title = (formData.get('title') as string) || ''
  const content = (formData.get('content') as string) || ''
  const linkUrl = await resolveBroadcastLinkFromForm(formData)
  const imageUrl = (formData.get('imageUrl') as string) || null
  const isActive = formData.get('isActive') === 'on'

  if (!id.trim()) {
    redirect('/admin/broadcasts?error=Broadcast%20ID%20tidak%20valid')
  }

  const { error } = await supabase
    .from('broadcasts')
    .update({
      title: title.trim(),
      content: content.trim(),
      link_url: linkUrl?.trim() || null,
      image_url: imageUrl?.trim() || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    redirect(`/admin/broadcasts/${encodeURIComponent(id)}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/broadcasts')
  revalidatePath('/')
  redirect('/admin/broadcasts?message=Siaran%20berhasil%20diupdate')
}

export async function deleteBroadcastAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const broadcastId = (formData.get('broadcastId') as string | null) ?? ''
  if (!broadcastId.trim()) {
    redirect('/admin/broadcasts?error=Broadcast%20ID%20tidak%20valid')
  }

  const { error } = await supabase.from('broadcasts').delete().eq('id', broadcastId)
  if (error) {
    redirect(`/admin/broadcasts?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/broadcasts')
  revalidatePath('/')
  redirect('/admin/broadcasts?message=Siaran%20berhasil%20dihapus')
}

export async function updateOrderShippingAction(formData: FormData) {
  await checkAdmin()
  const supabase = createAdminClient()

  const orderId = (formData.get('orderId') as string | null) ?? ''
  const status = (formData.get('status') as string | null) ?? ''
  const trackingNumber = ((formData.get('trackingNumber') as string | null) ?? '').trim()

  if (!orderId.trim()) {
    redirect('/admin/orders?error=Order%20ID%20tidak%20valid')
  }

  const updateData: Record<string, string | null> = {
    status: status.trim() || 'processing',
    tracking_number: trackingNumber || null,
    updated_at: new Date().toISOString(),
  }

  if (status === 'shipped') {
    updateData.shipped_at = new Date().toISOString()
  }
  if (status === 'delivered' || status === 'completed') {
    updateData.delivered_at = new Date().toISOString()
  }

  const { error } = await supabase.from('orders').update(updateData).eq('id', orderId)
  if (error) {
    redirect(`/admin/orders/${encodeURIComponent(orderId)}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/orders')
  redirect(`/admin/orders/${encodeURIComponent(orderId)}?message=Pengiriman%20berhasil%20diupdate`)
}

function formatPct(value: number) {
  const rounded = Math.round(value * 10) / 10
  const label = `${Math.abs(rounded).toFixed(1)}%`
  if (rounded > 0) return `+${label}`
  if (rounded < 0) return `-${label}`
  return '0%'
}

function formatDelta(value: number, suffix: string) {
  if (value > 0) return `+${value} ${suffix}`
  if (value < 0) return `${value} ${suffix}`
  return `0 ${suffix}`
}

async function getVisitorAnalytics() {
  const admin = createAdminClient()
  const now = new Date()
  const start24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const start48h = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const start5m = new Date(now.getTime() - 5 * 60 * 1000)
  const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const { data, error } = await admin
    .from('site_page_views')
    .select('*')
    .gte('visited_at', start7d.toISOString())
    .order('visited_at', { ascending: false })
    .limit(5000)

  if (error) {
    const setupRequired =
      error.code === 'PGRST205' ||
      error.code === '42P01' ||
      error.message.toLowerCase().includes('site_page_views')

    if (!setupRequired) {
      console.error('Analytics stats error:', error)
    }

    return {
      configured: false,
      setupRequired,
      pageViewsToday: 0,
      uniqueVisitorsToday: 0,
      onlineVisitors: 0,
      pageViewsTrend: '0%',
      uniqueVisitorsTrend: '0 visitors',
      topPages: [] as Array<{ path: string; views: number }>,
      recentVisitors: [] as Array<{
        id: string
        name: string | null
        email: string | null
        path: string
        visitedAt: string
      }>,
    }
  }

  let pageViewsCurrent = 0
  let pageViewsPrevious = 0
  const uniqueVisitorsCurrent = new Set<string>()
  const uniqueVisitorsPrevious = new Set<string>()
  const onlineVisitors = new Set<string>()
  const topPagesMap = new Map<string, number>()
  const recentVisitors: Array<{
    id: string
    name: string | null
    email: string | null
    path: string
    visitedAt: string
  }> = []

  for (const row of data ?? []) {
    const visitedAt = new Date((row as { visited_at: string }).visited_at).getTime()
    const visitorId = ((row as { visitor_id: string }).visitor_id ?? '').toString()
    const path = ((row as { path: string }).path ?? '/').toString()
    const visitedAtIso = ((row as { visited_at: string }).visited_at ?? '').toString()
    const email =
      typeof (row as { user_email: string }).user_email === 'string' && (row as { user_email: string }).user_email.trim()
        ? ((row as { user_email: string }).user_email as string).trim()
        : null
    const name =
      typeof (row as { user_name: string }).user_name === 'string' && (row as { user_name: string }).user_name.trim()
        ? ((row as { user_name: string }).user_name as string).trim()
        : null

    if (!Number.isFinite(visitedAt)) continue

    if (visitedAt >= start24h.getTime()) {
      pageViewsCurrent += 1
      if (visitorId) uniqueVisitorsCurrent.add(visitorId)
    } else if (visitedAt >= start48h.getTime()) {
      pageViewsPrevious += 1
      if (visitorId) uniqueVisitorsPrevious.add(visitorId)
    }

    if (visitedAt >= start5m.getTime() && visitorId) {
      onlineVisitors.add(visitorId)
    }

    topPagesMap.set(path, (topPagesMap.get(path) ?? 0) + 1)

    if (recentVisitors.length < 8) {
      recentVisitors.push({
        id: `${visitorId || "guest"}-${visitedAtIso}-${recentVisitors.length}`,
        name,
        email,
        path,
        visitedAt: visitedAtIso,
      })
    }
  }

  const pageViewsToday = pageViewsCurrent
  const previousPageViews = pageViewsPrevious
  const uniqueVisitorsToday = uniqueVisitorsCurrent.size
  const previousUniqueVisitors = uniqueVisitorsPrevious.size

  const pageViewsTrend =
    previousPageViews === 0
      ? pageViewsToday > 0
        ? 100
        : 0
      : ((pageViewsToday - previousPageViews) / previousPageViews) * 100

  const uniqueVisitorsDelta = uniqueVisitorsToday - previousUniqueVisitors

  return {
    configured: true,
    setupRequired: false,
    pageViewsToday,
    uniqueVisitorsToday,
    onlineVisitors: onlineVisitors.size,
    pageViewsTrend: formatPct(pageViewsTrend),
    uniqueVisitorsTrend: formatDelta(uniqueVisitorsDelta, 'visitors'),
    topPages: Array.from(topPagesMap.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5),
    recentVisitors,
  }
}

export async function getAdminStats() {
  await checkAdmin()
  const supabase = createAdminClient()

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('gross_amount, created_at')
    .eq('payment_status', 'paid')

  if (ordersError) {
    throw ordersError
  }

  const now = new Date()
  const startCurrentWindow = new Date(now)
  startCurrentWindow.setDate(now.getDate() - 7)
  const startPreviousWindow = new Date(now)
  startPreviousWindow.setDate(now.getDate() - 14)
  const startNewWindow = new Date(now)
  startNewWindow.setHours(now.getHours() - 24)

  const currentWindowStartMs = startCurrentWindow.getTime()
  const previousWindowStartMs = startPreviousWindow.getTime()
  const newWindowStartMs = startNewWindow.getTime()

  let currentRevenue = 0
  let previousRevenue = 0
  let newOrdersCount = 0
  for (const o of orders ?? []) {
    const createdAtMs = new Date((o as { created_at: string }).created_at).getTime()
    const amount = Number((o as { gross_amount: string }).gross_amount) || 0
    if (createdAtMs >= newWindowStartMs) newOrdersCount += 1
    if (createdAtMs >= currentWindowStartMs) {
      currentRevenue += amount
    } else if (createdAtMs >= previousWindowStartMs) {
      previousRevenue += amount
    }
  }

  const revenueChangePct =
    previousRevenue === 0
      ? currentRevenue > 0
        ? 100
        : 0
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100

  const totalRevenue =
    (orders ?? []).reduce((sum: number, order: { gross_amount: string }) => sum + (Number(order.gross_amount) || 0), 0) || 0
  const totalOrders = (orders ?? []).length

  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('name, stock')
    .lt('stock', 10)
    .limit(5)

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const analytics = await getVisitorAnalytics()

  return {
    totalRevenue,
    totalOrders,
    revenueTrend: formatPct(revenueChangePct),
    newOrdersTrend: `+${newOrdersCount} new`,
    lowStockProducts,
    recentOrders,
    analytics,
  }
}
