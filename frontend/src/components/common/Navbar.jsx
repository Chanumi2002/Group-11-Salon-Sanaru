import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/api";
import { useCart } from "@/context/CartContext";
import { readAuthState } from "@/utils/authState";
import logoImage from "@/assets/logo.jpeg";

const guestNavLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Products", to: "/products" },
  { label: "About Us", to: "/about-us" },
];

const customerNavLinks = [
  { label: "Services", to: "/customer_dashboard/services" },
  { label: "Products", to: "/products" },
];

const adminNavLinks = [
  { label: "Dashboard", to: "/admin_dashboard" },
  { label: "Users", to: "/admin_dashboard/users" },
  { label: "Products", to: "/admin_dashboard/products" },
  { label: "Services", to: "/admin_dashboard/services" },
];

const isLinkActive = (location, to) => {
  if (to === "/") {
    return location.pathname === "/";
  }

  if (to.startsWith("/#")) {
    return location.pathname === "/" && location.hash === to.slice(1);
  }

  return location.pathname === to;
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authState, setAuthState] = useState(() => readAuthState());
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const updateAuthState = () => {
      setAuthState(readAuthState());
    };

    updateAuthState();
    window.addEventListener("storage", updateAuthState);
    window.addEventListener("focus", updateAuthState);

    return () => {
      window.removeEventListener("storage", updateAuthState);
      window.removeEventListener("focus", updateAuthState);
    };
  }, [location.pathname]);

  const isCustomerLoggedIn = authState.isCustomer;
  const isAdminLoggedIn = authState.isAdmin;
  const navLinks = isCustomerLoggedIn
    ? customerNavLinks
    : isAdminLoggedIn
      ? adminNavLinks
      : guestNavLinks;
  const brandHomeLink = isCustomerLoggedIn
    ? "/customer_dashboard"
    : isAdminLoggedIn
      ? "/admin_dashboard"
      : "/";

  const handleCartClick = () => {
    if (!isCustomerLoggedIn) {
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    navigate("/cart");
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState({ token: null, role: null });
    navigate("/login");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "border-[#E9DDDD] bg-[#FFF8F7]/88 shadow-[0_12px_28px_-20px_rgba(29,22,22,0.45)] backdrop-blur-md"
          : "border-transparent bg-[#FFF8F7]/60 backdrop-blur-sm"
      }`}
    >
      <div className="relative mx-auto flex h-[4.6rem] w-full max-w-[1380px] items-center px-5 sm:px-8 lg:px-12">
        <Link to={brandHomeLink} className="flex items-center gap-2.5 shrink-0">
          <img src={logoImage} alt="Salon Sanaru Logo" className="h-10 w-10 object-contain rounded-full" />
          <span
            className="text-[1.24rem] font-semibold tracking-[0.02em] text-[#1D1616] leading-none font-body"
          >
            Salon Sanaru
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative pb-1 text-[0.95rem] font-medium tracking-[0.04em] uppercase transition-all duration-300 ${
                isLinkActive(location, link.to)
                  ? "text-[#8E1616] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-full after:bg-[#8E1616] after:content-['']"
                  : "text-[#5B4A4A] hover:text-[#8E1616]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 ml-auto">
          {isCustomerLoggedIn ? (
            <button
              type="button"
              onClick={handleCartClick}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8D4D4] bg-[#FFF8F7] text-[#3D2F2F] transition-colors hover:text-[#8E1616]"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#D84040] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
          ) : null}

          {isCustomerLoggedIn ? (
            <>
              <Button
                variant="ghost"
                asChild
                className="px-3 text-[0.95rem] font-medium text-[#3D2F2F] hover:text-[#8E1616] hover:bg-transparent"
              >
                <Link to="/customer_dashboard">My Dashboard</Link>
              </Button>
              <Button
                onClick={handleLogout}
                className="rounded-full px-6 bg-[#8E1616] text-[#FDF8F8] shadow-[0_10px_22px_-14px_rgba(142,22,22,0.75)] transition-all duration-300 hover:bg-[#D84040]"
              >
                Logout
              </Button>
            </>
          ) : isAdminLoggedIn ? (
            <>
              <Button
                variant="ghost"
                asChild
                className="px-3 text-[0.95rem] font-medium text-[#3D2F2F] hover:text-[#8E1616] hover:bg-transparent"
              >
                <Link to="/admin_dashboard">Admin Panel</Link>
              </Button>
              <Button
                onClick={handleLogout}
                className="rounded-full px-6 bg-[#8E1616] text-[#FDF8F8] shadow-[0_10px_22px_-14px_rgba(142,22,22,0.75)] transition-all duration-300 hover:bg-[#D84040]"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="px-3 text-[0.95rem] font-medium text-[#3D2F2F] hover:text-[#8E1616] hover:bg-transparent"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="rounded-full px-6 bg-[#8E1616] text-[#FDF8F8] shadow-[0_10px_22px_-14px_rgba(142,22,22,0.75)] transition-all duration-300 hover:bg-[#D84040]"
              >
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8D4D4] bg-[#FFF8F7] text-[#1D1616] transition-colors hover:text-[#8E1616]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#E9DDDD] bg-[#FFF8F7]/96 backdrop-blur-md px-5 pb-5 pt-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block rounded-md px-2 py-2 text-sm uppercase tracking-[0.08em] font-medium transition-colors ${
                isLinkActive(location, link.to)
                  ? "text-[#8E1616] bg-[#F7E4E2]/60"
                  : "text-[#5B4A4A] hover:text-[#8E1616]"
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-2">
            {isCustomerLoggedIn ? (
              <button
                type="button"
                onClick={handleCartClick}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8D4D4] bg-[#FFF8F7] text-[#3D2F2F] transition-colors hover:text-[#8E1616]"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#D84040] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </button>
            ) : null}

            {isCustomerLoggedIn ? (
              <>
                <Button variant="ghost" asChild className="flex-1 text-[#3D2F2F] hover:text-[#8E1616]">
                  <Link to="/customer_dashboard">Dashboard</Link>
                </Button>
                <Button onClick={handleLogout} className="flex-1 rounded-full bg-[#8E1616] hover:bg-[#D84040]">
                  Logout
                </Button>
              </>
            ) : isAdminLoggedIn ? (
              <>
                <Button variant="ghost" asChild className="flex-1 text-[#3D2F2F] hover:text-[#8E1616]">
                  <Link to="/admin_dashboard">Admin</Link>
                </Button>
                <Button onClick={handleLogout} className="flex-1 rounded-full bg-[#8E1616] hover:bg-[#D84040]">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="flex-1 text-[#3D2F2F] hover:text-[#8E1616]">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="flex-1 rounded-full bg-[#8E1616] hover:bg-[#D84040]">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
