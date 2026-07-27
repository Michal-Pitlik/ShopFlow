import { useState, useEffect } from "react";
import { useCreateProductMutation, useUpdateProductMutation, useGetCategoriesQuery } from "@/store/slices/apiSlice";
import type { Product } from "@/types";

interface Props {
  product?: Product | null;
  onClose: () => void;
}

const emptyForm = { name: "", description: "", price: "", stock: "", category: "", imageUrl: "" };

export default function ProductFormModal({ product, onClose }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [customCategory, setCustomCategory] = useState(false);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const { data: categories = [] } = useGetCategoriesQuery();

  useEffect(() => {
    if (product) {
      const knownCategory = categories.includes(product.category);
      setCustomCategory(!knownCategory);
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        stock: String(product.stock),
        category: product.category,
        imageUrl: product.imageUrl ?? "",
      });
    } else {
      setForm(emptyForm);
      setCustomCategory(false);
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    if (product) {
      await updateProduct({ id: product.id, ...payload });
    } else {
      await createProduct(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
        <h2 className="text-lg font-bold">{product ? "Edit Product" : "New Product"}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            {!customCategory ? (
              <div className="flex gap-2">
                <select
                  className="input flex-1"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => { setCustomCategory(true); setForm({ ...form, category: "" }); }}
                  className="btn-outline text-sm px-3 whitespace-nowrap"
                >
                  + New
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Enter new category..."
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setCustomCategory(false); setForm({ ...form, category: "" }); }}
                  className="btn-outline text-sm px-3"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" className="input" value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" step="0.01" min="0" className="input" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" min="0" className="input" value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">Save</button>
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}