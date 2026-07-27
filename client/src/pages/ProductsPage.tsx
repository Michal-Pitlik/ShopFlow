import { useState } from "react";
import { useGetProductsQuery } from "@/store/slices/apiSlice";
import ProductCard from "@/components/product/ProductCard";
import ProductFiltersComponent from "@/components/product/ProductFilters";
import ProductFormModal from "@/components/product/ProductFormModal";
import { PageLoader, ErrorMessage } from "@/components/ui";
import { useAppSelector } from "@/hooks/redux";
import type { ProductFilters, Product } from "@/types";

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 12 });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { data, isLoading, isError } = useGetProductsQuery(filters);
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex gap-8">
      <aside className="w-56 flex-shrink-0">
        <ProductFiltersComponent filters={filters} onChange={setFilters} />
      </aside>

      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <div className="flex items-center gap-4">
            {data && <p className="text-sm text-gray-500">{data.pagination.total} results</p>}
            {isAdmin && (
              <button onClick={() => setEditingProduct({} as Product)} className="btn-primary text-sm">
                + Add Product
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorMessage message="Failed to load products. Please try again." />
        ) : data?.products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No products found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.products.map((product) => (
              <ProductCard key={product.id} product={product} onEdit={setEditingProduct} />
            ))}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              disabled={filters.page === 1}
              className="btn-outline px-4 py-2 text-sm"
            >
              Previous
            </button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {filters.page} of {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              disabled={filters.page === data.pagination.totalPages}
              className="btn-outline px-4 py-2 text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {editingProduct && (
        <ProductFormModal
          product={"id" in editingProduct ? editingProduct : null}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}