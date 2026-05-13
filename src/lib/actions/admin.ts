'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient, ensureProductImagesBucket } from '@/lib/supabase/admin'

// Helper to check if user is admin
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
  const isActive = formData.get('isActive') === 'on'
  const sizes = formData.get('sizes')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []
  const colors = formData.get('colors')?.toString().split(',').map(c => c.trim()).filter(Boolean) || []
  const imageFile = formData.get('image') as File | null

  const productData = {
    name,
    slug,
    description,
    price,
    stock,
    category_id: categoryId,
    is_active: isActive,
    variants: { sizes, colors },
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
      const raw = (error as any)?.message?.toString?.() || "Gagal menyimpan kategori"
      const lower = raw.toLowerCase()
      if (lower.includes("row-level security") || lower.includes("rls")) {
        return "Gagal menyimpan kategori (RLS). Tambahkan policy INSERT untuk admin di tabel categories."
      }
      if ((error as any)?.code === "23505" || lower.includes("duplicate key")) {
        return "Slug sudah digunakan. Gunakan slug lain yang unik."
      }
      return raw
    })()
    redirect(`/admin/categories/new?error=${encodeURIComponent(message)}`)
  }

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function deleteProduct(productId: string) {
  await checkAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw error

  revalidatePath('/admin/products')
  revalidatePath('/')
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

  if (!userId.trim()) return
  if (userId === user.id) return

  const isAdmin = role === "admin"
  if (role !== "admin" && role !== "user") return

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId)

  if (error) throw error

  revalidatePath("/admin/users")
}

export async function getAdminStats() {
  await checkAdmin()
  const supabase = await createClient()

  // Total Sales
  const { data: orders } = await supabase
    .from('orders')
    .select('gross_amount, status, created_at')
    .eq('payment_status', 'settlement')

  const totalRevenue = orders?.reduce((sum, order) => sum + order.gross_amount, 0) || 0
  const totalOrders = orders?.length || 0

  // Low stock products
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('name, stock')
    .lt('stock', 10)
    .limit(5)

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    totalRevenue,
    totalOrders,
    lowStockProducts,
    recentOrders,
  }
}
