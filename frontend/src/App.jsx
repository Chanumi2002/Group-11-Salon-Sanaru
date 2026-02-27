import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/admin_dashboard" replace />} />
      <Route path="/admin_dashboard" element={<AdminDashboard />} />
      <Route path="/admin_dashboard/users" element={<AdminUsers />} />
      <Route path="*" element={<Navigate to="/admin_dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
