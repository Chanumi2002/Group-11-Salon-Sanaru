import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/api";
import { useCart } from "@/context/CartContext";
import {
  LayoutDashboard,
  User,
  CalendarPlus,
  CalendarCheck,
  ShoppingCart,
  Briefcase,
  ReceiptText,
  LogOut,
  Menu,
  X,
   Sparkles,
  Star,
} from "lucide-react";
import logoImage from "@/assets/logo.jpeg";

const sidebarLinks = [
  { label: "Dashboard", to: "/customer_dashboard", icon: LayoutDashboard },
  { label: "Manage Profile", to: "/customer_profile", icon: User },
  { label: "Shop Products", to: "/customer_dashboard/shop", icon: ShoppingCart },
  { label: "My Orders", to: "/customer_dashboard/orders", icon: ReceiptText },
  { label: "Booking a Service", to: "/customer_dashboard/services", icon: Briefcase },
  { label: "Book Appointment", to: "/customer_dashboard/book", icon: CalendarPlus },
  { label: "My Bookings", to: "/customer_dashboard/bookings", icon: CalendarCheck },
  { label: "Reviews & Ratings", to: "/customer_dashboard/reviews", icon: Star },
  { label: "AI Advisor", to: "/customer_dashboard/ai-recommendation", icon: Sparkles },
];

export function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { cartCount } = useCart();
  const cartItemCount = cartCount || 0;

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
        className={`fixed inset-y-0 left-0 z-50 w-[282px] h-screen bg-[#F8F8F8] border-r border-[#D8D8D8] flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-6 h-20 border-b border-border">
          <img src={logoImage} alt="Salon Sanaru Logo" className="h-11 w-11 object-cover rounded-full" />
          <span className="font-display text-xl font-bold text-foreground">
            Salon Sanaru
          </span>
          <button
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#D8D8D8]">
          <div className="rounded-full bg-[#F3D9D9] px-3 py-2 text-center text-sm font-semibold text-[#A72B2B]">
            Customer Panel
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const active =
              location.pathname === link.to || location.pathname.startsWith(link.to + "/");
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[1.02rem] font-medium transition-colors ${
                  active
                    ? "bg-[#EF1F1F] text-white"
                    : "text-slate-600 hover:bg-[#ECECEC] hover:text-slate-900"
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 py-4 border-t border-[#D8D8D8]">
          <button
            onClick={() => {
              authService.logout();
              navigate("/login");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-[#A72B2B] hover:bg-[#F8E7E7] transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[282px]">
        <header className="h-20 border-b border-border bg-white flex items-center px-4 lg:px-12 gap-6">
          <button
            className="lg:hidden text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Customer Portal
          </h2>
          <div className="flex items-center gap-4 ml-auto">
            <Link
              to="/cart"
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors relative"
              title="My Cart"
            >
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#8E1616] rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link
              to="/customer_profile"
              className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
              title="My Account"
            >
              <User className="h-6 w-6 text-muted-foreground" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
