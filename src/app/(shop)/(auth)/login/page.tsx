import Link from "next/link"
import { login } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md border-4 border-foreground bg-white p-8 md:p-12 shadow-[12px_12px_0_0_rgba(0,0,0,1)] rounded-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Login</h1>
          <p className="text-muted-foreground font-bold italic">Masuk ke akun RupaStyle Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm rounded-xl">
            Error: {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 border-2 border-primary bg-primary/10 text-primary font-bold text-sm rounded-xl">
            {message}
          </div>
        )}

        <form action={login} className="space-y-6">
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
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-base font-black uppercase">Password</Label>
              <Link href="#" className="text-sm font-bold text-muted-foreground hover:text-primary underline">Lupa password?</Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-14 border-4 border-foreground rounded-xl px-4 text-lg focus-visible:ring-primary focus-visible:ring-offset-0"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 border-4 border-foreground bg-primary text-white font-black uppercase text-xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl mt-4"
          >
            Masuk Sekarang
          </Button>
        </form>
        
        <div className="mt-10 text-center border-t-4 border-foreground/10 pt-6">
          <p className="font-bold text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="text-primary hover:underline font-black uppercase ml-1">
              Daftar Disini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
