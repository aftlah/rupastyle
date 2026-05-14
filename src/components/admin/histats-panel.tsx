type HistatsPanelProps = {
  title?: string;
  analytics: {
    configured: boolean;
    setupRequired: boolean;
    pageViewsToday: number;
    uniqueVisitorsToday: number;
    onlineVisitors: number;
    pageViewsTrend: string;
    uniqueVisitorsTrend: string;
    topPages: Array<{ path: string; views: number }>;
    recentVisitors: Array<{
      id: string;
      name: string | null;
      email: string | null;
      path: string;
      visitedAt: string;
    }>;
  };
};

export default function HistatsPanel({
  title = "Visitor Statistics",
  analytics,
}: HistatsPanelProps) {
  return (
    <section className="bg-white border-4 border-foreground p-8 shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-xl space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground font-bold italic mt-1">
            Analytics
          </p>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          {analytics.configured ? "Live" : "Setup Required"}
        </span>
      </div>

      {analytics.configured ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniStatCard
              label="Page Views 24h"
              value={analytics.pageViewsToday.toString()}
              trend={analytics.pageViewsTrend}
            />
            <MiniStatCard
              label="Unique Visitors 24h"
              value={analytics.uniqueVisitorsToday.toString()}
              trend={analytics.uniqueVisitorsTrend}
            />
            <MiniStatCard
              label="Online Visitors"
              value={analytics.onlineVisitors.toString()}
              trend="5 min window"
            />
          </div>

          <div className="border-2 border-foreground/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b-2 border-foreground/10 bg-secondary/20 flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-wider">
                Top Pages
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                Last 7 days
              </span>
            </div>

            <div className="divide-y divide-foreground/10">
              {analytics.topPages.length > 0 ? (
                analytics.topPages.map((page) => (
                  <div
                    key={page.path}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="font-bold truncate pr-4">{page.path}</span>
                    <span className="font-black uppercase text-xs">
                      {page.views} views
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground font-bold">
                  Belum ada data kunjungan yang terekam.
                </div>
              )}
            </div>
          </div>

          <div className="border-2 border-foreground/10 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b-2 border-foreground/10 bg-secondary/20 flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-wider">
                Recent Visitors
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                Login users if available
              </span>
            </div>

            <div className="divide-y divide-foreground/10">
              {analytics.recentVisitors.length > 0 ? (
                analytics.recentVisitors.map((visitor) => (
                  <div
                    key={visitor.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-black truncate">
                        {visitor.name || "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground font-bold truncate">
                        {visitor.email || "Pengunjung anonim"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold truncate max-w-40">
                        {visitor.path}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatVisitedAt(visitor.visitedAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground font-bold">
                  Belum ada kunjungan visitor yang terekam.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="border-2 border-dashed border-foreground/20 rounded-xl p-4 text-sm text-muted-foreground font-bold space-y-2">
          <p>Tabel analytics custom belum tersedia di database.</p>
          <p>
            Buat tabel `site_page_views` di Supabase agar tracker visitor mulai
            mengisi dashboard admin.
          </p>
        </div>
      )}
    </section>
  );
}

function formatVisitedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function MiniStatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  const tone = trend.trim().startsWith("-")
    ? "text-red-700 bg-red-100 border-red-700/20"
    : trend === "0%" || trend === "0 visitors"
      ? "text-gray-700 bg-gray-100 border-gray-700/20"
      : "text-green-700 bg-green-100 border-green-700/20";

  return (
    <div className="border-2 border-foreground/10 rounded-xl p-4 bg-secondary/10">
      <div className="flex items-start justify-between gap-4 mb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <span
          className={`text-[10px] font-black uppercase px-2 py-1 border rounded-xl ${tone}`}
        >
          {trend}
        </span>
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
