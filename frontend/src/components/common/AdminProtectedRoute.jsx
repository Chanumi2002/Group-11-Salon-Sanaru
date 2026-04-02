import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { readAuthState } from "@/utils/authState";

export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, role } = readAuthState();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth status
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/customer_dashboard" replace />;
  }

  return children;
}
