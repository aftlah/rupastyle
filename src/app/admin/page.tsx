import { getAdminStats } from "@/lib/actions/admin"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, ShoppingBag, AlertTriangle, Clock, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import AdminAutoRefresh from "@/components/admin/admin-auto-refresh"

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-8">
      <AdminAutoRefresh intervalMs={5000} />
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tight">Overview Dashboard</h1>
        <p className="text-muted-foreground font-bold italic mt-1">Real-time store performance and analytics</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={<TrendingUp className="text-green-600" />} 
          color="bg-green-100"
          trend="+12.5%"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders.toString()} 
          icon={<ShoppingBag className="text-blue-600" />} 
          color="bg-blue-100"
          trend="+5 new"
        />
        <StatCard 
          title="Avg. Order Value" 
          value={formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)} 
          icon={<TrendingUp className="text-purple-600" />} 
          color="bg-purple-100"
        />
        <StatCard 
          title="Low Stock Alert" 
          value={stats.lowStockProducts?.length.toString() || "0"} 
          icon={<AlertTriangle className="text-orange-600" />} 
          color="bg-orange-100"
          urgent={stats.lowStockProducts && stats.lowStockProducts.length > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <section className="bg-white border-4 border-foreground p-8 shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-100 border-2 border-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-xl">
                <Clock size={24} className="text-blue-600" />
              </div>
              Recent Orders
            </h3>
            <Link href="/admin/orders" className="text-xs font-black uppercase hover:text-primary transition-colors flex items-center gap-1 group">
              View All <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border-2 border-foreground/10 hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-black text-sm uppercase">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground font-bold">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm">{formatCurrency(order.gross_amount)}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                      (order.payment_status ?? "").toString().trim().toLowerCase() === 'paid' ||
                      (order.payment_status ?? "").toString().trim().toLowerCase() === 'settlement'
                        ? 'bg-green-400'
                        : 'bg-yellow-400'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground font-bold italic">No orders found</p>
            )}
          </div>
        </section>

        {/* Stock Alerts */}
        <section className="bg-white border-4 border-foreground p-8 shadow-[10px_10px_0_0_rgba(0,0,0,1)] rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <div className="p-2 bg-orange-100 border-2 border-foreground shadow-[2px_2px_0_0_rgba(0,0,0,1)] rounded-xl">
                <AlertTriangle size={24} className="text-orange-600" />
              </div> 
              Inventory Alerts
            </h3>
            <Link href="/admin/products" className="text-xs font-black uppercase hover:text-primary transition-colors flex items-center gap-1 group">
              Manage <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between p-4 border-2 border-foreground/10 bg-orange-50/30">
                  <p className="font-black text-sm uppercase line-clamp-1 flex-1 mr-4">{product.name}</p>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase text-red-600 block mb-1">Low Stock</span>
                    <p className="font-black text-lg">{product.stock} left</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-muted-foreground font-bold italic">Inventory looks healthy</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, trend, urgent }: any) {
  return (
    <div className={`p-6 border-4 border-foreground bg-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all ${urgent ? 'ring-8 ring-orange-500/10' : ''} rounded-xl`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 border-4 border-foreground shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${color} rounded-xl`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-3 py-1 border-2 border-green-700/20 rounded-xl">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </div>
  )
}
