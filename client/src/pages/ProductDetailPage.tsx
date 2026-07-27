import { useParams, Link } from "react-router-dom";
import { useGetProductByIdQuery } from "@/store/slices/apiSlice";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart } from "@/store/slices/cartSlice";
import { PageLoader, ErrorMessage } from "@/components/ui";
import { formatPrice } from "@/utils";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { data: product, isLoading, isError } = useGetProductByIdQuery(Number(id));

  if (isLoading) return <PageLoader />;
  if (isError || !product) return <ErrorMessage message="Product not found." />;

  return (
    <div className="space-y-4">
      <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700">
        ← Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
        <img
          src={product.imageUrl ?? `https://placehold.co/600x500?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          className="w-full rounded-xl object-cover aspect-square"
        />

        <div className="space-y-4">
          <span className="text-sm text-primary-600 font-medium uppercase tracking-wide">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? `✓ In stock (${product.stock} available)` : "✗ Out of stock"}
          </div>

          <button
            onClick={() => dispatch(addToCart(product))}
            disabled={product.stock === 0}
            className="btn-primary w-full py-3 text-base"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
