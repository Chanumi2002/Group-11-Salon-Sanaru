import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService } from "@/services/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (orderId) => {
    if (!window.confirm("Approve payment for this order?")) {
      return;
    }

    try {
      setActionLoading(orderId);
      await adminService.approveOrderPayment(orderId);
      toast.success("Payment approved successfully");
      await fetchOrders();
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error(error.response?.data?.message || "Failed to approve payment");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (value) => {
    return value ? new Date(value).toLocaleString() : "-";
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
          <p className="text-muted-foreground">Review and manage customer orders and payments.</p>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Order #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Created</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b border-border hover:bg-muted transition">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{order.orderNumber || order.orderReference || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{order.status || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{order.paymentStatus || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {order.totalAmount ? `₹${order.totalAmount}` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {order.status === "PENDING_PAYMENT" || order.paymentStatus === "INITIATED" ? (
                          <button
                            onClick={() => handleApprovePayment(order.orderId)}
                            disabled={actionLoading === order.orderId}
                            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
                          >
                            {actionLoading === order.orderId ? "Approving..." : "Approve Payment"}
                          </button>
                        ) : (
                          <span className="text-sm text-green-700">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
