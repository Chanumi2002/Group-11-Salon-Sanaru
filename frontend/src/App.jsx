import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import { FeedbackProvider } from "./context/FeedbackContext";

// Public pages
import Index from "./pages/public/Index";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import OAuthCallback from "./pages/public/OAuthCallback";
import NotFound from "./pages/public/NotFound";
import Shop from "./pages/public/Shop";
import Services from "./pages/public/Services";
import GuestProducts from "./pages/public/GuestProducts";
import GuestProductDetails from "./pages/public/GuestProductDetails";
import GuestServiceDetails from "./pages/public/GuestServiceDetails";
import ProductsByCategory from "./pages/public/ProductsByCategory";
import ShopProductDetails from "./pages/public/ShopProductDetails";
import About from "./pages/public/About";
import PaymentSuccess from "./pages/public/PaymentSuccess";
import PaymentCancel from "./pages/public/PaymentCancel";
import CartPage from "./pages/CartPage";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Homepage from "./pages/customer/Homepage";
import Profile from "./pages/customer/Profile";
import CustomerServices from "./pages/customer/CustomerServices";
import BookAppointment from "./pages/customer/BookAppointment";
import CustomerOrders from "./pages/customer/CustomerOrders";
import AiRecommendation from "./pages/customer/AiRecommendation";
import CustomerShop from "./pages/customer/CustomerShop";
import CustomerReviews from "./pages/customer/CustomerReviews";
import CustomerBookings from "./pages/customer/CustomerBookings";
import WriteReview from "./pages/customer/WriteReview";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminUsers from "./pages/admin/AdminUsers";
import CategoryPage from "./pages/admin/CategoryPage";
import ProductPage from "./pages/admin/ProductPage";
import ServicePage from "./pages/admin/ServicePage";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminFeedback from "./pages/admin/AdminFeedback";
import BookingManagement from "./pages/admin/BookingManagement";

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
          <FeedbackProvider>
            <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/products" element={<GuestProducts />} />
              <Route path="/products/:id" element={<GuestProductDetails />} />
              <Route path="/guest-products" element={<GuestProducts />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<GuestServiceDetails />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />
              <Route path="/products/category/:categoryId/product/:id" element={<ShopProductDetails />} />
              <Route path="/shop" element={<Navigate to="/products" replace />} />
              <Route path="/shop/products/:id" element={<ShopProductDetails />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />
              <Route path="/cart" element={<CartPage />} />
            
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
                path="/customer_dashboard/services"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerServices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer_dashboard/book"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer_dashboard/orders"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer_dashboard/ai-recommendation"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <AiRecommendation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer_dashboard/shop"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerShop />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer_dashboard/reviews"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerReviews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer_dashboard/bookings"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer_dashboard/write-review"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <WriteReview />
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

              <Route
                path="/admin_dashboard/inventory"
                element={
                  <AdminProtectedRoute>
                    <AdminInventory />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin_dashboard/services"
                element={
                  <AdminProtectedRoute>
                    <ServicePage />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin_dashboard/transactions"
                element={
                  <AdminProtectedRoute>
                    <AdminTransactions />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin_dashboard/orders"
                element={
                  <AdminProtectedRoute>
                    <AdminOrders />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin_dashboard/payments"
                element={
                  <AdminProtectedRoute>
                    <AdminTransactions />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin_dashboard/feedback"
                element={
                  <AdminProtectedRoute>
                    <AdminFeedback />
                  </AdminProtectedRoute>
                }
              />

              <Route
                path="/admin_dashboard/appointments"
                element={
                  <AdminProtectedRoute>
                    <BookingManagement />
                  </AdminProtectedRoute>
                }
              />

              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
          </CartProvider>
            </FeedbackProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);

export default App;
