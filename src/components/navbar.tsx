import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import CartButton from "./navbar/cart-button"
import MobileNav from "./navbar/mobile-nav"
import { UserAvatarDropdown } from "@/components/user-avatar-dropdown"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let isAdmin = false
  let displayName = ""
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, full_name")
      .eq("id", user.id)
      .maybeSingle()
    isAdmin = Boolean(profile?.is_admin)
    displayName = (profile?.full_name ?? "").trim() || (user.email?.split("@")[0] ?? "")
  }

  return (
    <nav className="border-b-4 border-foreground bg-white sticky top-0 z-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <div className="flex items-center gap-4">
            <MobileNav isLoggedIn={Boolean(user)} />
            <Link 
              href="/" 
              className="inline-block text-2xl md:text-4xl font-black tracking-tighter uppercase bg-primary text-white px-4 md:px-5 py-2 border-4 border-foreground shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-xl transform -rotate-3 hover:rotate-0"
            >
              RupaStyle
            </Link>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="hidden md:flex items-center gap-6">
              <Link href="/products" className="text-lg font-black uppercase hover:text-primary transition-colors">
                Produk
              </Link>
              <Link href="/stores" className="text-lg font-black uppercase hover:text-primary transition-colors">
                Toko
              </Link>
              {user ? <CartButton initialCount={0} /> : null}
            </div>
            
            <div className="h-10 w-1 bg-foreground/20 hidden md:block" />

            <div className="flex items-center gap-4">
              {user ? (
                <UserAvatarDropdown
                  name={displayName || "User"}
                  email={user.email ?? ""}
                  isAdmin={isAdmin}
                  logoutAction={logout}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/register" 
                    className="hidden sm:inline-block text-sm font-black uppercase hover:text-primary"
                  >
                    Daftar
                  </Link>
                  <Link 
                    href="/login" 
                    className="border-4 border-foreground px-4 md:px-6 py-2 md:py-3 text-sm md:text-lg font-black uppercase hover:bg-foreground hover:text-white bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-xl"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
