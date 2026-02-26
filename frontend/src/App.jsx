import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'

// Test component
function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Salon Sanaru is Loading...</h1>
      <p>If you see this, the app is working!</p>
    </div>
  )
}

// Public Pages
import Index from './pages/public/Index'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import NotFound from './pages/public/NotFound'
import OAuthCallback from './pages/public/OAuthCallback'

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import Homepage from './pages/customer/Homepage'
import CustomerProfile from './pages/customer/Profile'

// Admin Pages
import AdminProfile from './pages/admin/AdminProfile'

// Components
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Test Route */}
        <Route path="/test" element={<TestPage />} />

        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />

        {/* Customer Routes */}
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
              <CustomerProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin_dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminProfile />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Router>
  )
}

export default App
