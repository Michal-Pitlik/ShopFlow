import { useState } from "react";
import { useGetProductsQuery, useDeleteProductMutation } from "@/store/slices/apiSlice";
import ProductFormModal from "@/components/product/ProductFormModal";
import { PageLoader, ErrorMessage } from "@/components/ui";
import { formatPrice } from "@/utils";
import type { Product } from "@/types";

export default function AdminProducts() {
  const { data, isLoading, isError } = useGetProductsQuery({ limit: 50 });
  const [deleteProduct] = useDeleteProductMutation();
  const [editingProduct, setEditingProduct] = useState<Product | null | "new">(null);

  const handleDelete = async (id: number) => {
    if (confirm("Delete this product?")) await deleteProduct(id);
  };

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorMessage message="Failed to load products." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={() => setEditingProduct("new")} className="btn-primary text-sm">
          + Add Product
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock > 0 ? "text-green-600" : "text-red-500"}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => setEditingProduct(p)} className="text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingProduct !== null && (
        <ProductFormModal
          product={editingProduct === "new" ? null : editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}