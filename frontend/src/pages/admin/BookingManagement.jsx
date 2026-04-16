import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService } from "@/services/api";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2, Filter, AlertTriangle } from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", cls: "bg-orange-100 text-orange-700 font-semibold ring-1 ring-orange-300" },
  CONFIRMED: { label: "Confirmed", cls: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-gray-100 text-gray-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

const getStatus = (s) =>
  STATUS_CONFIG[s] ?? { label: s ?? "—", cls: "bg-gray-100 text-gray-600" };

const formatTime = (timeString) => {
  if (!timeString) return "—";
  const [hour, minute] = timeString.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minute} ${ampm}`;
};

export default function BookingManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAppointments();
      setAppointments(response.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appointmentId, action) => {
    const messages = {
      approve: {
        title: "Approve Appointment?",
        description: "This appointment will be confirmed and the customer will be notified.",
        icon: CheckCircle,
        btnColor: "bg-green-500 hover:bg-green-600",
        success: "Appointment approved successfully!"
      },
      reject: {
        title: "Reject Appointment?",
        description: "The customer will be notified that their appointment request was rejected.",
        icon: XCircle,
        btnColor: "bg-red-500 hover:bg-red-600",
        success: "Appointment rejected."
      },
    };

    const config = messages[action];
    const IconComponent = config.icon;

    const ConfirmationDialog = () => (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <IconComponent className={`h-5 w-5 ${action === 'approve' ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{config.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.description}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                setActionId(`${appointmentId}-${action}`);
                if (action === "approve") {
                  await adminService.approveAppointment(appointmentId);
                } else {
                  await adminService.rejectAppointment(appointmentId);
                }

                toast.success(config.success, {
                  description: action === 'approve' ? 'Customer notification sent.' : 'Customer has been notified.',
                });
                await fetchAppointments();
              } catch (error) {
                console.error(`Error performing ${action}:`, error);
                toast.error(error.response?.data?.message || `Failed to ${action} appointment`);
              } finally {
                setActionId(null);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${config.btnColor} text-white transition-colors text-sm font-medium`}
          >
            {action === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    );

    toast.custom((t) => <ConfirmationDialog />, {
      duration: 7000,
      style: {
        background: "#fff",
        border: action === 'approve' ? "2px solid #10b981" : "2px solid #ef4444",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  // Filter appointments based on status and date
  const getFilteredAppointments = () => {
    return appointments.filter((appt) => {
      // Filter by status
      if (statusFilter !== "ALL" && appt.status !== statusFilter) {
        return false;
      }
      
      // Filter by date
      if (dateFilter && appt.date !== dateFilter) {
        return false;
      }
      
      return true;
    });
  };

  const filteredAppointments = getFilteredAppointments();
  const hasActiveFilters = statusFilter !== "ALL" || dateFilter !== "";

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Management</h1>
          <p className="text-muted-foreground">
            Review and manage customer appointments. Pending requests require your approval.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 bg-card border border-border rounded-lg p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition font-medium text-sm mb-4"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 text-xs font-bold">
                {(statusFilter !== "ALL" ? 1 : 0) + (dateFilter ? 1 : 0)}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed/Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Filter by Date</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter("")}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 transition text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setDateFilter("");
                  }}
                  className="md:col-span-2 px-4 py-2 rounded-lg bg-gray-200 text-foreground hover:bg-gray-300 transition font-medium text-sm"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              Showing <strong>{filteredAppointments.length}</strong> of <strong>{appointments.length}</strong> appointments
              {statusFilter !== "ALL" && <span> • Status: <strong>{statusFilter.toLowerCase()}</strong></span>}
              {dateFilter && <span> • Date: <strong>{dateFilter}</strong></span>}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading appointments…</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No appointments found.</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No appointments match your filters.</p>
              <button
                onClick={() => {
                  setStatusFilter("ALL");
                  setDateFilter("");
                }}
                className="mt-2 text-primary hover:underline text-sm font-medium"
              >
                Clear filters to see all appointments
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    {["ID", "Customer", "Service", "Date", "Time", "Status", "Actions"].map((h) => (
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
                  {filteredAppointments.map((appt) => {
                    const { label, cls } = getStatus(appt.status);
                    const isPending = appt.status === "PENDING";

                    return (
                      <tr
                        key={appt.id}
                        className={`border-b border-border transition ${isPending ? "bg-orange-50/40" : "hover:bg-muted"}`}
                      >
                        <td className="px-6 py-4 font-medium text-foreground">
                          #{appt.id}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {appt.customerName}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {appt.serviceName}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">
                          {appt.date}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatTime(appt.time)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs ${cls}`}>{label}</span>
                        </td>
                        <td className="px-6 py-4">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAction(appt.id, "approve")}
                                disabled={!!actionId}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50"
                                title="Approve booking"
                              >
                                {actionId === `${appt.id}-approve` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(appt.id, "reject")}
                                disabled={!!actionId}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition disabled:opacity-50"
                                title="Reject booking"
                              >
                                {actionId === `${appt.id}-reject` ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="flex justify-end text-xs text-muted-foreground">No action</span>
                          )}
                        </td>
                      </tr>
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
