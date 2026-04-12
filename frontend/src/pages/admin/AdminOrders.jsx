import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService } from "@/services/api";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, Package } from "lucide-react";

// ── Status helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: { label: "Pending", cls: "bg-gray-100 text-gray-700" },
  PENDING_PAYMENT: { label: "Pending Payment", cls: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "Confirmed", cls: "bg-green-100 text-green-700" },
  PAID: { label: "Confirmed", cls: "bg-green-100 text-green-700" }, // legacy
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  CANCELLATION_REQUESTED: { label: "Cancellation Pending", cls: "bg-orange-100 text-orange-700 font-semibold ring-1 ring-orange-300" },
};

const getStatus = (s) =>
  STATUS_CONFIG[s] ?? { label: s ?? "—", cls: "bg-gray-100 text-gray-600" };

const formatDate = (v) => (v ? new Date(v).toLocaleString() : "—");
const toMoney = (v) => (v != null ? `Rs. ${Number(v).toFixed(2)}` : "—");

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // orderId currently being acted on
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  useEffect(() => { fetchOrders(); }, []);

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

  const handleAction = async (orderId, action) => {
    const messages = {
      cancel: { confirm: "Approve this cancellation request? The order will be cancelled.", success: "Order cancelled successfully." },
      reject: { confirm: "Reject this cancellation request? The order will revert to Confirmed.", success: "Cancellation request rejected." },
      approve: { confirm: "Manually approve this order? It will be marked as Confirmed.", success: "Order approved successfully." },
    };
    if (!window.confirm(messages[action].confirm)) return;

    try {
      setActionId(`${orderId}-${action}`);
      if (action === "cancel") await adminService.cancelOrder(orderId);
      else if (action === "reject") await adminService.rejectCancelOrder(orderId);
      else await adminService.approveOrder(orderId);

      toast.success(messages[action].success);
      await fetchOrders();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
          <p className="text-muted-foreground">
            Review and manage customer orders. Orders with a{" "}
            <span className="font-medium text-orange-600">Cancellation Pending</span> status are awaiting your decision.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    {["Order #", "Status", "Payment", "Total", "Created", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-sm font-semibold text-foreground ${h === "Actions" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const { label, cls } = getStatus(order.status);
                    const isCancellationPending = order.status === "CANCELLATION_REQUESTED";
                    const isExpanded = expandedOrderId === order.orderId;

                    return (
                      <React.Fragment key={order.orderId}>
                        <tr
                          className={`border-b border-border transition ${isCancellationPending ? "bg-orange-50/40" : "hover:bg-muted"}`}
                        >
                          {/* Order # */}
                          <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                            <button onClick={() => toggleExpand(order.orderId)} className="text-muted-foreground hover:text-foreground">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            {order.orderNumber ?? order.orderReference ?? `#${order.orderId}`}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs ${cls}`}>{label}</span>
                          </td>

                          {/* Payment */}
                          <td className="px-6 py-4 text-muted-foreground">
                            {order.paymentStatus ?? "—"}
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4 font-medium text-foreground">
                            {toMoney(order.totalAmount)}
                          </td>

                          {/* Created */}
                          <td className="px-6 py-4 text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            {isCancellationPending ? (
                              <div className="flex items-center justify-end gap-2">
                                {/* Approve cancellation */}
                                <button
                                  onClick={() => handleAction(order.orderId, "cancel")}
                                  disabled={!!actionId}
                                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                                  title="Approve cancellation — order will be marked Cancelled"
                                >
                                  {actionId === `${order.orderId}-cancel` ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  )}
                                  Approve
                                </button>

                                {/* Reject cancellation */}
                                <button
                                  onClick={() => handleAction(order.orderId, "reject")}
                                  disabled={!!actionId}
                                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                                  title="Reject cancellation — order reverts to Confirmed"
                                >
                                  {actionId === `${order.orderId}-reject` ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5" />
                                  )}
                                  Reject
                                </button>
                              </div>
                            ) : (
                              order.status !== "CONFIRMED" && order.status !== "PAID" && order.status !== "CANCELLED" ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleAction(order.orderId, "approve")}
                                    disabled={!!actionId}
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50"
                                    title="Approve order manually"
                                  >
                                    {actionId === `${order.orderId}-approve` ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-3.5 w-3.5" />
                                    )}
                                    Approve
                                  </button>
                                </div>
                              ) : (
                                <span className="flex justify-end text-xs text-muted-foreground">No action</span>
                              )
                            )}
                          </td>
                        </tr>
                        {/* Expanded Section for Items */}
                        {isExpanded && (
                          <tr className="bg-muted/30 border-b border-border">
                            <td colSpan="6" className="px-6 py-4">
                              <div className="rounded-md border border-border bg-card p-4">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                                  <Package className="h-4 w-4 text-primary" /> Order Items ({order.items?.length || 0})
                                </h4>
                                {order.items && order.items.length > 0 ? (
                                  <ul className="space-y-2">
                                    {order.items.map((item, idx) => (
                                      <li key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                          <span className="font-medium text-foreground">{item.productName}</span>
                                          <span className="text-xs text-muted-foreground">{item.quantity} x {toMoney(item.unitPrice)}</span>
                                        </div>
                                        <span className="font-semibold text-foreground">{toMoney(item.subTotal)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No items available for this order.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
