import { Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Prevent admin users from accessing customer routes
  if (userRole === "ADMIN") {
    return <Navigate to="/admin_dashboard" replace />;
  }

  return children;
}
