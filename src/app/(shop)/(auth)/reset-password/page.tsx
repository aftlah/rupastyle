"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [isReady, setIsReady] = useState(false)
  const [hasUser, setHasUser] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (cancelled) return
        setHasUser(Boolean(data.user))
        setIsReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setHasUser(false)
        setIsReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [supabase])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!hasUser) {
      setError("Sesi reset tidak ditemukan. Silakan minta link reset ulang.")
      return
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.")
      return
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.")
      return
    }

    setPending(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setPending(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    await supabase.auth.signOut()
    router.push("/login?message=Password%20berhasil%20diubah.%20Silakan%20login%20kembali.")
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md border-4 border-foreground bg-white p-8 md:p-12 shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Buat Password Baru</h1>
          <p className="text-muted-foreground font-bold italic">
            Masukkan password baru untuk akun Anda
          </p>
        </div>

        {!isReady ? (
          <div className="text-center py-10">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {!hasUser ? (
              <div className="mb-6 p-4 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm rounded-xl">
                Link reset tidak valid atau sudah kadaluarsa. Silakan minta link reset ulang.
              </div>
            ) : null}

            {error ? (
              <div className="mb-6 p-4 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm rounded-xl">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mb-6 p-4 border-2 border-primary bg-primary/10 text-primary font-bold text-sm rounded-xl">
                {message}
              </div>
            ) : null}

            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-black uppercase">
                  Password Baru
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 border-4 border-foreground rounded-xl px-4 text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
                  disabled={!hasUser || pending}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirm" className="text-base font-black uppercase">
                  Konfirmasi Password
                </Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-14 border-4 border-foreground rounded-xl px-4 text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
                  disabled={!hasUser || pending}
                  required
                />
              </div>

              <Button
                type="submit"
                isLoading={pending}
                disabled={!hasUser || pending}
                className="w-full h-14 border-4 border-foreground bg-primary text-white font-black uppercase text-xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl mt-4"
              >
                Simpan Password
              </Button>
            </form>

            <div className="mt-10 text-center border-t-4 border-foreground/10 pt-6">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline font-black uppercase"
              >
                Minta Link Reset Ulang
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
