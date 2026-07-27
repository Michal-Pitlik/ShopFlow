import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { removeFromCart, updateQuantity, selectCartItems, selectCartTotal } from "@/store/slices/cartSlice";
import { useCreateOrderMutation } from "@/store/slices/apiSlice";
import { clearCart } from "@/store/slices/cartSlice";
import { formatPrice } from "@/utils";
import { EmptyState } from "@/components/ui";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      }).unwrap();
      dispatch(clearCart());
      navigate(`/orders/${order.id}`);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "data" in err
        ? (err as { data: { error: string } }).data.error
        : "Checkout failed";
      alert(message);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add some products to get started."
        action={<button onClick={() => navigate("/products")} className="btn-primary">Browse Products</button>}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      <div className="card divide-y divide-gray-100">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="p-4 flex items-center gap-4">
            <img
              src={product.imageUrl ?? `https://placehold.co/80x80?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-sm text-gray-500">{formatPrice(product.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity - 1 }))}
                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >−</button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => dispatch(updateQuantity({ productId: product.id, quantity: quantity + 1 }))}
                disabled={quantity >= product.stock}
                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >+</button>
            </div>
            <p className="w-20 text-right font-semibold text-gray-900">
              {formatPrice(product.price * quantity)}
            </p>
            <button
              onClick={() => dispatch(removeFromCart(product.id))}
              className="text-red-400 hover:text-red-600 text-sm ml-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="btn-primary w-full py-3 text-base"
        >
          {isLoading ? "Placing order..." : isAuthenticated ? "Place Order" : "Sign in to Checkout"}
        </button>
      </div>
    </div>
  );
}
