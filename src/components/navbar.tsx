import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { Button } from "./ui/button"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="border-b-2 border-foreground bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-black tracking-tighter uppercase bg-primary text-white px-2 py-1 transform -rotate-1 hover:rotate-0 transition-transform border-2 border-foreground shadow-[4px_4px_0_0_rgba(0,0,0,0.9)] rounded-sm">
              RupaStyle
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold hover:text-primary transition-colors uppercase border-b-2 border-transparent hover:border-primary">
              Home
            </Link>
            <Link href="/outfit-builder" className="text-sm font-bold hover:text-primary transition-colors uppercase border-b-2 border-transparent hover:border-primary">
              Outfit
            </Link>
            <Link href="/cart" className="text-sm font-bold hover:text-primary transition-colors uppercase border-b-2 border-transparent hover:border-primary flex items-center gap-2">
              Cart
            </Link>

            {user ? (
              <div className="flex items-center gap-4 border-l-2 border-foreground/20 pl-6">
                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 border border-primary/20 rounded-full truncate max-w-[150px]">
                  {user.email?.split('@')[0]}
                </span>
                <form action={logout}>
                  <Button variant="outline" size="sm" className="border-2 border-foreground font-bold uppercase hover:bg-foreground hover:text-white transition-colors">
                    Logout
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l-2 border-foreground/20 pl-6">
                <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,0.9)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all bg-white">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="border-2 border-foreground font-bold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,0.9)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.9)] hover:-translate-y-0.5 transition-all bg-primary text-white hover:bg-primary/90">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
