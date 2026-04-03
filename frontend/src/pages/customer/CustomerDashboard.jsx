import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/common/DashboardLayout";
import { Button } from "@/components/ui/Button";

const cards = [
  {
    title: "Salon services",
    desc: "Compare service details, pricing, and duration.",
    to: "/customer_dashboard/services",
    cta: "View services",
  },
  {
    title: "My bookings",
    desc: "Check your upcoming and past appointments.",
    to: "/customer_dashboard/bookings",
    cta: "View bookings",
  },
  {
    title: "Orders",
    desc: "Track product purchases and order status.",
    to: "/customer_dashboard/orders",
    cta: "View orders",
  },
  {
    title: "Profile",
    desc: "Update your personal details anytime.",
    to: "/customer_dashboard/profile",
    cta: "Edit profile",
  },
  {
    title: "AI Beauty Advisor",
    desc: "Get personalized product & service recommendations.",
    to: "/customer_dashboard/ai-recommendation",
    cta: "Ask AI",
  },
];

export default function CustomerDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Dashboard</h1>
          <p className="text-gray-600">
            Shortcuts to everything you need—book services, manage appointments, and
            track orders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.title} className="border border-gray-300 p-4 flex flex-col">
              <h2 className="font-bold mb-1">{c.title}</h2>
              <p className="text-sm text-gray-600 mb-4 flex-1">{c.desc}</p>
              <Button asChild variant="secondary" className="w-full">
                <Link to={c.to}>{c.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="border border-gray-300 p-4">
          <h2 className="font-bold mb-2 flex items-center gap-2">
            <span className="text-purple-600">✨</span> AI Beauty Advisor
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            Not sure what services or products are right for your hair and skin type? 
            Try out our new AI Beauty Advisor for personalized curations!
          </p>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
            <Link to="/customer_dashboard/ai-recommendation">Get Recommendations</Link>
          </Button>
        </div>

        <div className="border border-gray-300 p-4">
          <h2 className="font-bold mb-2">Homepage snapshot</h2>
          <p className="text-sm text-gray-600 mb-3">
            Your account overview is now available under Homepage.
          </p>
          <Button asChild>
            <Link to="/customer_dashboard/homepage">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

