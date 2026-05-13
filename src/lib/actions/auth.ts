'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '../supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  return redirect('/')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error('Register error:', error.message)
    return redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // Check if session exists (means email confirmation is disabled)
  if (data?.session) {
    revalidatePath('/', 'layout')
    return redirect('/')
  }

  // If no session, usually means email confirmation is required
  return redirect('/login?message=Silakan cek email Anda untuk konfirmasi pendaftaran.')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get("email") as string | null) ?? ""
  if (!email.trim()) {
    return redirect("/forgot-password?error=Email wajib diisi")
  }

  const h = await headers()
  const origin =
    h.get("origin") ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`

  const redirectTo = `${origin}/auth/callback?next=/reset-password`

  await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
  return redirect(
    "/forgot-password?message=Jika%20email%20terdaftar,%20link%20reset%20password%20sudah%20dikirim.%20Silakan%20cek%20inbox%20atau%20spam."
  )
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return redirect('/login')
}
