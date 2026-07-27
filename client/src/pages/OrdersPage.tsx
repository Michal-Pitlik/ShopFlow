import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "@/store/slices/apiSlice";
import { PageLoader, ErrorMessage, EmptyState } from "@/components/ui";
import { formatPrice, formatDate, getStatusBadgeClass } from "@/utils";

export default function OrdersPage() {
  const { data: orders, isLoading, isError } = useGetMyOrdersQuery();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorMessage message="Failed to load orders." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      {orders?.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Once you place an order it'll show up here."
          action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow block">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
              </div>
              <div className="text-right space-y-2">
                <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
