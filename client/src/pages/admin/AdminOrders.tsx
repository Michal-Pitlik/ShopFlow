import { useState } from "react";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "@/store/slices/apiSlice";
import { PageLoader, ErrorMessage } from "@/components/ui";
import { formatPrice, formatDate, getStatusBadgeClass } from "@/utils";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading, isError } = useGetAllOrdersQuery({ status: statusFilter || undefined });
  const [updateStatus] = useUpdateOrderStatusMutation();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorMessage message="Failed to load orders." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select
          className="input w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Order", "Customer", "Items", "Total", "Date", "Status", "Update"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{order.id}</td>
                <td className="px-4 py-3 text-gray-600">{order.user?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{order.items.length}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                    value={order.status}
                    onChange={(e) => updateStatus({ id: order.id, status: e.target.value as OrderStatus })}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
