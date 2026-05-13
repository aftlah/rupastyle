import { createClient } from "@/lib/supabase/server"
import { setUserRoleAction } from "@/lib/actions/admin"

type AdminUserRow = {
  id: string
  full_name: string | null
  phone: string | null
  is_admin: boolean | null
  created_at: string
}

export const metadata = {
  title: "Users - Admin | RupaStyle",
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, is_admin, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    throw error
  }

  const rows = (users ?? []) as AdminUserRow[]

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight">Users</h1>
        <p className="text-muted-foreground font-bold italic mt-1">Daftar user yang terdaftar</p>
      </header>

      <section className="bg-white border-4 border-foreground p-6 shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">All Users</h2>
          <div className="text-xs font-black uppercase text-muted-foreground tracking-widest">
            Total {rows.length}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-16 border-2 border-foreground/10 border-dashed rounded-xl">
            <p className="text-muted-foreground font-bold italic">Belum ada user</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b-2 border-foreground/10">
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Name</th>
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Phone</th>
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Role</th>
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">User ID</th>
                  <th className="py-3 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Created</th>
                  <th className="py-3 text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b border-foreground/10 hover:bg-primary/5 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold">{u.full_name || "-"}</div>
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">{u.phone || "-"}</td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center px-2 py-1 text-[10px] font-black uppercase border border-foreground rounded-xl">
                        {u.is_admin ? "admin" : "user"}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="font-mono text-xs">{u.id}</span>
                    </td>
                    <td className="py-4 text-muted-foreground font-bold">
                      {new Date(u.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="py-4">
                      {user?.id === u.id ? (
                        <div className="text-right text-xs font-bold text-muted-foreground">Tidak bisa ubah diri sendiri</div>
                      ) : (
                        <form action={setUserRoleAction} className="flex items-center justify-end gap-2">
                          <input type="hidden" name="userId" value={u.id} />
                          <select
                            name="role"
                            defaultValue={u.is_admin ? "admin" : "user"}
                            className="h-10 px-3 border-2 border-foreground font-bold bg-white rounded-xl"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            type="submit"
                            className="h-10 px-4 border-2 border-foreground bg-primary text-white font-black uppercase text-xs shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl"
                          >
                            Simpan
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
