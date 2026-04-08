import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = sessionStorage.getItem("shopzen_admin") === "true";
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
