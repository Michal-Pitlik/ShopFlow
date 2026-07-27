import { Link } from "react-router-dom";
import { useGetProductsQuery } from "@/store/slices/apiSlice";
import ProductCard from "@/components/product/ProductCard";
import { PageLoader } from "@/components/ui";

export default function HomePage() {
  const { data, isLoading } = useGetProductsQuery({ limit: 4 });

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-20 bg-gradient-to-br from-primary-50 to-blue-100 rounded-2xl">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Welcome to <span className="text-primary-600">ShopFlow</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Discover quality products at great prices. Fast shipping, easy returns.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/products" className="btn-primary px-6 py-3 text-base">
            Shop Now
          </Link>
          <Link to="/register" className="btn-outline px-6 py-3 text-base">
            Create Account
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: "🚚", title: "Free Shipping", desc: "On orders over $50" },
          { icon: "↩️", title: "Easy Returns", desc: "30-day return policy" },
          { icon: "🔒", title: "Secure Checkout", desc: "Your data is safe with us" },
        ].map((f) => (
          <div key={f.title} className="card p-6 text-center">
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-gray-900">{f.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
