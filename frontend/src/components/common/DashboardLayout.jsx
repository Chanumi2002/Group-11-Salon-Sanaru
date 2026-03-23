import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/api";
import {
  LayoutDashboard,
  User,
  CalendarPlus,
  CalendarCheck,
  ShoppingBag,
  Briefcase,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logoImage from "@/assets/logo.jpeg";
const sidebarLinks = [
  { label: "Customer Dashboard", to: "/customer_dashboard", icon: LayoutDashboard },
  { label: "Profile", to: "/customer_profile", icon: User },
  { label: "Products", to: "/products", icon: ShoppingBag },
  { label: "Services", to: "/customer_dashboard/services", icon: Briefcase },
  { label: "Book Appointment", to: "/customer_dashboard/book", icon: CalendarPlus },
  { label: "My Bookings", to: "/customer_dashboard/bookings", icon: CalendarCheck },
  { label: "Orders", to: "/customer_dashboard/orders", icon: ShoppingBag },
];

export function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
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

        <nav className="flex-1 py-6 px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const active =
              location.pathname === link.to || location.pathname.startsWith(link.to + "/");
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                  ? "bg-primary text-primary-foreground shadow-salon"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-white flex items-center px-4 lg:px-8 gap-4">
          <button
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="font-display text-lg font-semibold text-foreground flex-1">
            Customer Portal
          </h2>
          <div className="flex items-center gap-3">
            <Link
              to="/customer_profile"
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
              title="My Account"
            >
              <User className="h-4 w-4 text-muted-foreground" />
            </Link>
            <button
              onClick={() => { authService.logout(); navigate("/login"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
