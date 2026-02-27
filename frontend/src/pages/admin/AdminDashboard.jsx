import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { Users, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { adminService } from "@/services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    customerCount: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError("");
        const [countResponse, customersResponse] = await Promise.all([
          adminService.getCustomerCount(),
          adminService.getCustomers(),
        ]);

        const customers = customersResponse.data ?? [];
        const activeCount = customers.filter((customer) => customer.enabled).length;
        const blockedCount = customers.filter((customer) => !customer.enabled).length;

        setStats({
          customerCount: countResponse.data?.count ?? customers.length,
          activeCustomers: activeCount,
          blockedCustomers: blockedCount,
        });
        setRecentCustomers(customers.slice(0, 5));
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error("Error fetching admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const statCards = [
    {
      title: "Total Customers",
      value: stats.customerCount,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Active Customers",
      value: stats.activeCustomers,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Blocked Customers",
      value: stats.blockedCustomers,
      icon: UserX,
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
    },
  ];

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Monitor customer accounts using live Sanaru database data.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg p-6 bg-card animate-pulse"
              >
                <div className="h-4 bg-muted rounded mb-4 w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mb-8 p-6 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className={`border ${stat.borderColor} rounded-lg p-6 bg-card hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border border-border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Recent Customers
          </h2>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading customers...</p>
          ) : recentCustomers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No customers found.</p>
          ) : (
            <div className="space-y-3">
              {recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {`${customer.firstName} ${customer.lastName}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      customer.enabled
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {customer.enabled ? "ACTIVE" : "BLOCKED"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <a
            href="/admin_dashboard/users"
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            View all customers
          </a>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
