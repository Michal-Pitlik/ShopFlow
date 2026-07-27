import { useState, useEffect } from "react";
import { useGetCategoriesQuery } from "@/store/slices/apiSlice";
import type { ProductFilters } from "@/types";

interface Props {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export default function ProductFilters({ filters, onChange }: Props) {
  const { data: categories = [] } = useGetCategoriesQuery();
  const [search, setSearch] = useState(filters.search ?? "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ ...filters, search, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="card p-4 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          className="input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => onChange({ ...filters, category: undefined, page: 1 })}
            className={`block w-full text-left px-2 py-1.5 rounded text-sm ${!filters.category ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat, page: 1 })}
              className={`block w-full text-left px-2 py-1.5 rounded text-sm ${filters.category === cat ? "bg-primary-50 text-primary-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number"
            className="input"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value || undefined, page: 1 })}
          />
          <input
            type="number"
            className="input"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value || undefined, page: 1 })}
          />
        </div>
      </div>

      <button
        onClick={() => { setSearch(""); onChange({}); }}
        className="btn-outline w-full text-sm"
      >
        Clear Filters
      </button>
    </div>
  );
}
