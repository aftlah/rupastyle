import Link from "next/link"
import { register } from "@/lib/actions/auth"
import { FormSubmitButton } from "@/components/form-submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 bg-background py-10">
      <div className="w-full max-w-md border-4 border-foreground bg-white p-8 md:p-12 shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Daftar</h1>
          <p className="text-muted-foreground font-bold italic">Buat akun RupaStyle baru Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm rounded-xl">
            Error: {error}
          </div>
        )}

        <form action={register} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="fullName" className="text-base font-black uppercase">Nama Lengkap</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Contoh: Budi Santoso"
              required
              className="h-14 border-4 border-foreground rounded-xl px-4 text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email" className="text-base font-black uppercase">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
              className="h-14 border-4 border-foreground rounded-xl px-4 text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="text-base font-black uppercase">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-14 border-4 border-foreground rounded-xl px-4 text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
            />
          </div>
          <FormSubmitButton
            className="w-full h-14 border-4 border-foreground bg-primary text-white font-black uppercase text-xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl mt-4"
          >
            Daftar Sekarang
          </FormSubmitButton>
        </form>
        
        <div className="mt-10 text-center border-t-4 border-foreground/10 pt-6">
          <p className="font-bold text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline font-black uppercase ml-1">
              Login Disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
