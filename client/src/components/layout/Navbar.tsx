import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logout } from "@/store/slices/authSlice";
import { selectCartCount } from "@/store/slices/cartSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector(selectCartCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-primary-600">
            ShopFlow
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Products
            </Link>

            {isAuthenticated && user?.role === "ADMIN" && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Admin
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Orders */}
            {isAuthenticated && user?.role !== "ADMIN" && (
              <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
                Orders
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* <Link to="/orders" className="text-sm text-gray-600 hover:text-gray-900">
                  Orders
                </Link> */}
                <span className="text-sm text-gray-500">Hi, {user?.name.split(" ")[0]}</span>
                <button onClick={handleLogout} className="btn-outline text-sm py-1.5 px-3">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-outline text-sm py-1.5 px-3">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
