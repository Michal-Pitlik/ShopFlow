import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addToCart } from "@/store/slices/cartSlice";
import { useDeleteProductMutation } from "@/store/slices/apiSlice";
import { formatPrice } from "@/utils";
import type { Product } from "@/types";

interface Props {
  product: Product;
  onEdit?: (product: Product) => void;
}

export default function ProductCard({ product, onEdit }: Props) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === "ADMIN";
  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (confirm(`Delete "${product.name}"?`)) await deleteProduct(product.id);
  };

  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.imageUrl ?? `https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">
          {product.category}
        </span>

        <Link to={`/products/${product.id}`} className="mt-1 font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
          {product.name}
        </Link>

        <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          <span className={`text-xs ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {isAdmin ? (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onEdit?.(product)}
              className="btn-outline flex-1 text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger flex-1 text-sm"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => dispatch(addToCart(product))}
            disabled={product.stock === 0}
            className="btn-primary mt-3 w-full text-sm"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}