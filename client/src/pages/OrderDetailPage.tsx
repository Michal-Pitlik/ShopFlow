import { useParams, Link } from "react-router-dom";
import { useGetOrderByIdQuery } from "@/store/slices/apiSlice";
import { PageLoader, ErrorMessage } from "@/components/ui";
import { formatPrice, formatDate, getStatusBadgeClass } from "@/utils";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(Number(id));

  if (isLoading) return <PageLoader />;
  if (isError || !order) return <ErrorMessage message="Order not found." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/orders" className="text-sm text-primary-600 hover:text-primary-700">← My Orders</Link>

      <div className="card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.product.imageUrl ?? `https://placehold.co/60x60?text=${encodeURIComponent(item.product.name)}`}
                alt={item.product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
