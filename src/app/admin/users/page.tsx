import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { UserActionsPopover } from "@/components/admin/user-actions-popover"

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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error: errorMessage, message } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })

  if (usersError) throw usersError

  const authUsers = usersData?.users ?? []
  const ids = authUsers.map((u) => u.id)

  const { data: profiles, error: profilesError } = ids.length
    ? await admin
        .from("profiles")
        .select("id, full_name, phone, is_admin, created_at")
        .in("id", ids)
        .limit(200)
    : { data: [], error: null }

  if (profilesError) throw profilesError

  const profileById = new Map<string, AdminUserRow>(
    ((profiles ?? []) as AdminUserRow[]).map((p) => [p.id, p])
  )

  const rows = authUsers
    .map((u) => {
      const profile = profileById.get(u.id) ?? null
      return {
        id: u.id,
        email: u.email ?? "",
        full_name:
          profile?.full_name ??
          (typeof (u.user_metadata as any)?.full_name === "string"
            ? ((u.user_metadata as any).full_name as string)
            : null),
        phone: profile?.phone ?? null,
        is_admin: profile?.is_admin ?? false,
        created_at: profile?.created_at ?? u.created_at,
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight">Users</h1>
        <p className="text-muted-foreground font-bold italic mt-1">Daftar user yang terdaftar</p>
      </header>

      {typeof errorMessage === "string" && errorMessage ? (
        <div className="border-2 border-destructive bg-destructive/10 text-destructive font-bold text-sm px-4 py-3 rounded-xl">
          {errorMessage}
        </div>
      ) : null}
      {typeof message === "string" && message ? (
        <div className="border-2 border-primary bg-primary/10 text-primary font-bold text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      ) : null}

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
                  <th className="py-3 pr-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Email</th>
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
                    <td className="py-4 pr-4 text-muted-foreground">
                      {u.email ? <span className="font-bold">{u.email}</span> : "-"}
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
                      <div className="flex justify-end">
                        <UserActionsPopover
                          userId={u.id}
                          defaultRole={u.is_admin ? "admin" : "user"}
                          allowRoleChange={user?.id !== u.id}
                        />
                      </div>
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
