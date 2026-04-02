import { Navigate, useLocation } from "react-router-dom";
import { readAuthState } from "@/utils/authState";

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = readAuthState();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
