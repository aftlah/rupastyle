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
      .map((i: any) => getStoragePathFromPublicUrl(i.image_url))
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
