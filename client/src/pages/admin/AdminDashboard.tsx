import { Link } from "react-router-dom";
import { useGetAdminStatsQuery } from "@/store/slices/apiSlice";
import { PageLoader, ErrorMessage } from "@/components/ui";
import { formatPrice, formatDate, getStatusBadgeClass } from "@/utils";

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useGetAdminStatsQuery();

  if (isLoading) return <PageLoader />;
  if (isError || !stats) return <ErrorMessage message="Failed to load dashboard." />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/products" className="btn-primary text-sm">Manage Products</Link>
          <Link to="/admin/orders" className="btn-outline text-sm">Manage Orders</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: stats.totalOrders },
          { label: "Total Revenue", value: formatPrice(stats.totalRevenue) },
          { label: "Total Products", value: stats.totalProducts },
        ].map((s) => (
          <div key={s.label} className="card p-6">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentOrders.map((order) => (
            <Link key={order.id} to={`/admin/orders`} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm text-gray-900">Order #{order.id}</p>
                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                <span className="font-semibold text-sm">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
