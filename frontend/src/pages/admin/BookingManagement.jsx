import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService } from "@/services/api";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

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
      approve: { confirm: "Approve this appointment request?", success: "Appointment approved successfully." },
      reject: { confirm: "Reject this appointment?", success: "Appointment rejected." },
    };
    if (!window.confirm(messages[action].confirm)) return;

    try {
      setActionId(`${appointmentId}-${action}`);
      if (action === "approve") {
        await adminService.approveAppointment(appointmentId);
      } else {
        await adminService.rejectAppointment(appointmentId);
      }

      toast.success(messages[action].success);
      await fetchAppointments();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} appointment`);
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Management</h1>
          <p className="text-muted-foreground">
            Review and manage customer appointments. Pending requests require your approval.
          </p>
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
                  {appointments.map((appt) => {
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
