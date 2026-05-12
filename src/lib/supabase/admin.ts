import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function ensureProductImagesBucket() {
  const supabase = createAdminClient()

  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) throw listError

  const exists = (buckets ?? []).some((b) => b.name === "product-images")
  if (exists) return

  const { error: createError } = await supabase.storage.createBucket("product-images", {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  })

  if (createError) throw createError
}

