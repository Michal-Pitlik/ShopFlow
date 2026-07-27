import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";

interface Props {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: Props) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return <Outlet />;
}
