export default function AdminSettingsPage() {
  const checks = [
    { label: 'Supabase URL', ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) },
    { label: 'Supabase Anon Key', ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) },
    { label: 'Supabase Service Role', ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { label: 'Midtrans Server Key', ok: Boolean(process.env.MIDTRANS_SERVER_KEY) },
    { label: 'Midtrans Client Key', ok: Boolean(process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY) },
    { label: 'WhatsApp Number', ok: Boolean(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) },
  ]

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight">Settings</h1>
        <p className="text-muted-foreground font-medium mt-2">
          Ringkasan konfigurasi environment untuk RupaStyle.
        </p>
      </header>

      <section className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-black uppercase">Environment Checklist</h2>
        <ul className="space-y-3">
          {checks.map((item) => (
            <li key={item.label} className="flex items-center justify-between border-b border-foreground/10 pb-2">
              <span className="font-bold">{item.label}</span>
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-xl border-2 ${item.ok ? 'border-green-600 text-green-700 bg-green-50' : 'border-destructive text-destructive bg-destructive/10'}`}>
                {item.ok ? 'OK' : 'Missing'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border-4 border-foreground shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-black uppercase">Database Setup</h2>
        <p className="text-sm text-muted-foreground font-medium">
          Jalankan migration + seed jika belum:
        </p>
        <code className="block bg-muted p-4 rounded-xl text-sm font-bold">npm run setup:db</code>
      </section>
    </div>
  )
}
