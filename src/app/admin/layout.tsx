import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LayoutDashboard, Package, ShoppingCart, Users, Home, Settings, LogOut, Tags } from "lucide-react"
import { ensureProductImagesBucket } from "@/lib/supabase/admin"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  await ensureProductImagesBucket()

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-4 border-foreground hidden md:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-6 border-b-4 border-foreground bg-primary/5">
          <Link href="/admin" className="text-2xl font-black uppercase tracking-tighter bg-primary text-white px-4 py-2 border-4 border-foreground shadow-[4px_4px_0_0_rgba(0,0,0,1)] inline-block transform -rotate-2 hover:rotate-0 transition-transform rounded-xl">
            Admin CMS
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <AdminNavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <AdminNavLink href="/admin/products" icon={<Package size={20} />} label="Products" />
          <AdminNavLink href="/admin/categories" icon={<Tags size={20} />} label="Categories" />
          <AdminNavLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Orders" />
          <AdminNavLink href="/admin/users" icon={<Users size={20} />} label="Users" />
          <div className="pt-4 mt-4 border-t-2 border-foreground/10">
            <AdminNavLink href="/" icon={<Home size={20} />} label="View Site" />
            <AdminNavLink href="/admin/settings" icon={<Settings size={20} />} label="Settings" />
          </div>
        </nav>

        <div className="p-4 border-t-4 border-foreground">
          <form action="/api/auth/logout" method="POST">
            <button className="w-full flex items-center gap-3 px-4 py-3 font-black uppercase text-sm hover:bg-red-50 text-red-600 transition-colors border-2 border-transparent hover:border-red-600 rounded-xl">
              <LogOut size={18} />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fafafa]">
        <header className="h-24 bg-white border-b-4 border-foreground flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-2xl font-black uppercase tracking-tight">Control Panel</h2>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Administrator</p>
              <p className="text-sm font-bold">{user.email}</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-foreground bg-primary text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center font-black text-xl">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 px-4 py-3 font-black uppercase text-sm transition-all border-2 border-transparent hover:border-foreground hover:bg-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 rounded-xl"
    >
      {icon}
      {label}
    </Link>
  )
}
