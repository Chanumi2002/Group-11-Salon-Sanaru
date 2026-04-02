import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  LogOut,
  Menu,
  X,
  User,
  Folder,
} from "lucide-react";
import logoImage from "@/assets/logo.jpeg";

const adminSidebarLinks = [
  { label: "Dashboard", to: "/admin_dashboard", icon: LayoutDashboard },
  { label: "Manage Users", to: "/admin_dashboard/users", icon: Users },
  { label: "Manage Categories", to: "/admin_dashboard/categories", icon: Folder },
  { label: "Manage Products", to: "/admin_dashboard/products", icon: ShoppingCart },
  { label: "Manage Services", to: "/admin_dashboard/services", icon: Briefcase },
  { label: "Manage Orders", to: "/admin_dashboard/orders", icon: Package },
  { label: "Manage Payments", to: "/admin_dashboard/payments", icon: DollarSign },
  { label: "Reviews & Ratings", to: "/admin_dashboard/reviews", icon: Star },
];

export function AdminDashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f2ef] text-slate-900 [--background:36_22%_94%] [--foreground:222_47%_11%] [--card:0_0%_100%] [--card-foreground:222_47%_11%] [--muted:36_24%_91%] [--muted-foreground:215_16%_36%] [--accent:0_0%_97%] [--accent-foreground:222_47%_11%] [--border:30_14%_84%]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
          <img src={logoImage} alt="Salon Sanaru Logo" className="h-9 w-9 object-cover rounded-full" />
          <span className="font-display text-lg font-bold text-foreground">
            Salon Sanaru
          </span>
          <button
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Badge */}
        <div className="px-6 py-4 border-b border-border">
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold text-center">
            Admin Panel
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {adminSidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center">
            <button
              className="lg:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 lg:ml-0 text-lg font-semibold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin_dashboard/profile"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
              title="My Account"
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
