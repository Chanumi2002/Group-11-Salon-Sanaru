import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// Public pages
import Index from "./pages/public/Index";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import OAuthCallback from "./pages/public/OAuthCallback";
import NotFound from "./pages/public/NotFound";
import Shop from "./pages/public/Shop";
import ProductsByCategory from "./pages/public/ProductsByCategory";
import ShopProductDetails from "./pages/public/ShopProductDetails";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Homepage from "./pages/customer/Homepage";
import Profile from "./pages/customer/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminUsers from "./pages/admin/AdminUsers";
import CategoryPage from "./pages/admin/CategoryPage";
import ProductPage from "./pages/admin/ProductPage";

// Route protection
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/common/AdminProtectedRoute";

const App = () => (
  <GoogleOAuthProvider clientId="741049795663-ie03ksnfv4jfu5aesvod0fj1c41uopqr.apps.googleusercontent.com">
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route path="/products" element={<Shop />} />
            <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />
            <Route path="/products/category/:categoryId/product/:id" element={<ShopProductDetails />} />
            <Route path="/shop" element={<Navigate to="/products" replace />} />
            <Route path="/shop/products/:id" element={<ShopProductDetails />} />
            
            <Route
              path="/customer_dashboard"
              element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/homepage"
              element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <Homepage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer_profile"
              element={
                <ProtectedRoute requiredRole="CUSTOMER">
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin_dashboard"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin_dashboard/profile"
              element={
                <AdminProtectedRoute>
                  <AdminProfile />
                </AdminProtectedRoute>
              }
            />
            
            <Route
              path="/admin_dashboard/users"
              element={
                <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              }
            />
            
            <Route
              path="/admin_dashboard/categories"
              element={
                <AdminProtectedRoute>
                  <CategoryPage />
                </AdminProtectedRoute>
              }
            />
            
            <Route
              path="/admin_dashboard/products"
              element={
                <AdminProtectedRoute>
                  <ProductPage />
                </AdminProtectedRoute>
              }
            />
            
            <Route path="/not-found" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);

export default App;
