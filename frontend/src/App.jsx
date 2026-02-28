import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Public pages
import Index from "./pages/public/Index";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import OAuthCallback from "./pages/public/OAuthCallback";
import NotFound from "./pages/public/NotFound";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import Homepage from "./pages/customer/Homepage";
import Profile from "./pages/customer/Profile";
import BookAppointment from "./pages/customer/BookAppointment";
import MyBookings from "./pages/customer/MyBookings";
import Orders from "./pages/customer/Orders";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProfile from "./pages/admin/AdminProfile";

// Route protection
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/common/AdminProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route
              path="/customer_dashboard"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer_dashboard/homepage"
              element={
                <ProtectedRoute>
                  <Homepage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer_dashboard/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer_dashboard/book"
              element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer_dashboard/bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer_dashboard/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin_dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
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
              path="/admin_dashboard/profile"
              element={
                <AdminProtectedRoute>
                  <AdminProfile />
                </AdminProtectedRoute>
              }
            />

            {/* Backwards-compatible redirects */}
            <Route path="/dashboard" element={<Navigate to="/customer_dashboard" replace />} />
            <Route
              path="/dashboard/homepage"
              element={<Navigate to="/customer_dashboard/homepage" replace />}
            />
            <Route
              path="/dashboard/profile"
              element={<Navigate to="/customer_dashboard/profile" replace />}
            />
            <Route path="/dashboard/book" element={<Navigate to="/customer_dashboard/book" replace />} />
            <Route
              path="/dashboard/bookings"
              element={<Navigate to="/customer_dashboard/bookings" replace />}
            />
            <Route
              path="/dashboard/orders"
              element={<Navigate to="/customer_dashboard/orders" replace />}
            />

            <Route path="/homepage" element={<Navigate to="/customer_dashboard/homepage" replace />} />
            <Route
              path="/homepage/profile"
              element={<Navigate to="/customer_dashboard/profile" replace />}
            />
            <Route path="/homepage/book" element={<Navigate to="/customer_dashboard/book" replace />} />
            <Route
              path="/homepage/bookings"
              element={<Navigate to="/customer_dashboard/bookings" replace />}
            />
            <Route
              path="/homepage/orders"
              element={<Navigate to="/customer_dashboard/orders" replace />}
            />

            {/* Typo-friendly redirect */}
            <Route path="/coutomer_dashboard" element={<Navigate to="/customer_dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;