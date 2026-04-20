import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService } from "@/services/api";
import { Users, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import UpcomingBookings from "./UpcomingBookings";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [countResponse, customersResponse] = await Promise.all([
          adminService.getCustomerCount(),
          adminService.getCustomers(),
        ]);

        const customers = customersResponse?.data || [];
        const activeCustomers = customers.filter((customer) => customer.enabled !== false).length;
        const blockedCustomers = customers.filter((customer) => customer.enabled === false).length;
        const totalCustomers = countResponse?.data?.count ?? customers.length;

        setStats({
          totalCustomers,
          activeCustomers,
          blockedCustomers,
        });

        const sortedUsers = [...customers].sort((a, b) => (b.id || 0) - (a.id || 0));
        setRecentUsers(sortedUsers.slice(0, 5));
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error(error.response?.data?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Admin Panel</h1>
          <p className="text-muted-foreground">Monitor and manage customer accounts from here.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="border border-border rounded-lg p-6 bg-card animate-pulse">
                <div className="h-4 bg-muted rounded mb-4 w-1/2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            ))}
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
                      <p className="text-sm text-muted-foreground font-medium mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
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

        <div className="mt-8">
          <UpcomingBookings />
        </div>

        <div className="mt-8 border border-border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Customers</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No customers found.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user) => {
                const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{fullName || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.enabled === false ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.enabled === false ? "BLOCKED" : "ACTIVE"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <Link to="/admin_dashboard/users" className="text-sm text-primary hover:underline mt-4 inline-block">
            View all users -&gt;
          </Link>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
