import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logout } from "@/lib/actions/auth"
import { Button } from "./ui/button"
import CartButton from "./navbar/cart-button"
import { getCartCount } from "@/lib/cart"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let cartCount = 0
  if (user) {
    cartCount = await getCartCount(user.id)
  }

  return (
    <nav className="border-b-4 border-foreground bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          {/* LOGO AREA */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="inline-block text-3xl md:text-4xl font-black tracking-tighter uppercase bg-primary text-white px-5 py-2 border-4 border-foreground shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all rounded-sm transform -rotate-3 hover:rotate-0"
            >
              RupaStyle
            </Link>
          </div>

          {/* NAV LINKS */}
          <div className="flex items-center gap-10">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-xl font-black text-foreground hover:text-primary transition-colors border-b-4 border-transparent hover:border-primary py-1 uppercase">
                Home
              </Link>
              <Link href="/outfit-builder" className="text-xl font-black text-foreground hover:text-primary transition-colors border-b-4 border-transparent hover:border-primary py-1 uppercase">
                Outfit
              </Link>
              
              {/* INTERACTIVE CART BUTTON */}
              {user && <CartButton initialCount={cartCount} />}
            </div>
            
            <div className="h-10 w-1 bg-foreground/20 hidden md:block"></div>

            {/* AUTH ACTIONS */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="hidden lg:inline-block text-sm font-black bg-primary/10 text-primary px-4 py-2 border-2 border-primary/20 rounded-md truncate max-w-[150px]">
                    {user.email?.split('@')[0]}
                  </span>
                  <form action={logout}>
                    <Button variant="outline" size="lg" className="border-4 border-foreground font-black uppercase bg-white text-foreground hover:bg-foreground hover:text-white transition-colors h-14 px-8 text-lg shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                      Logout
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/login" 
                    className="border-4 border-foreground px-6 py-3 text-lg font-black uppercase text-foreground hover:bg-foreground hover:text-white transition-colors bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="hidden md:inline-block border-4 border-foreground bg-primary text-white px-6 py-3 text-lg font-black uppercase hover:bg-primary/90 transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  >
                    Join
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
