'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'

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
  const supabase = await createClient()

  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const categoryId = formData.get('categoryId') as string
  const isActive = formData.get('isActive') === 'on'
  const sizes = formData.get('sizes')?.toString().split(',').map(s => s.trim()).filter(Boolean) || []
  const colors = formData.get('colors')?.toString().split(',').map(c => c.trim()).filter(Boolean) || []

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

  // Handle images if provided in a separate step or here
  // For simplicity, we assume images are handled via uploadProductImage action

  revalidatePath('/admin/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/')
  
  return { success: true, productId }
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
  const supabase = await createClient()

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
