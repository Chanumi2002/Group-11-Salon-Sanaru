import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { closedDateService } from "@/services/api";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Calendar } from "lucide-react";

export default function AdminClosedDates() {
  const [closedDates, setClosedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    closedDate: "",
    reason: "",
    isActive: true,
  });

  useEffect(() => {
    fetchClosedDates();
  }, []);

  const fetchClosedDates = async () => {
    try {
      setLoading(true);
      const response = await closedDateService.getAllClosedDates();
      // Sort by date
      const sorted = (response.data || []).sort((a, b) => {
        return new Date(a.closedDate) - new Date(b.closedDate);
      });
      setClosedDates(sorted);
    } catch (error) {
      console.error("Error fetching closed dates:", error);
      toast.error(error.response?.data?.message || "Failed to load closed dates");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.closedDate) {
      toast.error("Please select a date");
      return;
    }

    // Check if date is in the past
    const selectedDate = new Date(formData.closedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Cannot add closed date in the past");
      return;
    }

    try {
      setActionId("submit");
      await closedDateService.addClosedDate({
        closedDate: formData.closedDate,
        reason: formData.reason.trim() || "Closed",
        isActive: formData.isActive,
      });

      toast.success("Closed date added successfully");
      setFormData({ closedDate: "", reason: "", isActive: true });
      setShowForm(false);
      await fetchClosedDates();
    } catch (error) {
      console.error("Error adding closed date:", error);
      toast.error(error.response?.data?.message || "Failed to add closed date");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (dateId) => {
    if (!window.confirm("Are you sure you want to remove this closed date?")) return;

    try {
      setActionId(`delete-${dateId}`);
      await closedDateService.deleteClosedDate(dateId);
      toast.success("Closed date removed successfully");
      await fetchClosedDates();
    } catch (error) {
      console.error("Error deleting closed date:", error);
      toast.error(error.response?.data?.message || "Failed to delete closed date");
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Closed Dates Management</h1>
          <p className="text-muted-foreground">
            Mark specific dates when your salon is closed (holidays, special events, maintenance, etc.).
          </p>
        </div>

        {/* Add Closed Date Section */}
        {!showForm ? (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
            >
              <Plus className="h-4 w-4" />
              Add Closed Date
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Add Closed Date</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Picker */}
                <div>
                  <label htmlFor="closedDate" className="block text-sm font-medium text-foreground mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="closedDate"
                    type="date"
                    name="closedDate"
                    value={formData.closedDate}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
                    Reason
                  </label>
                  <input
                    id="reason"
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    placeholder="e.g., Public Holiday, Maintenance"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Active Toggle */}
                <div>
                  <label htmlFor="isActive" className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <div className="flex items-center h-10">
                    <input
                      id="isActive"
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="w-4 h-4 rounded border-input accent-primary"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={!!actionId}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionId === "submit" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Closed Date
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-4 py-2 bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Closed Dates Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading closed dates…</p>
            </div>
          ) : closedDates.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No closed dates configured yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-primary hover:underline font-medium"
              >
                Add your first closed date
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    {["Date", "Reason", "Status", "Added On", "Actions"].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-sm font-semibold text-foreground ${
                          h === "Actions" ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {closedDates.map((closedDate) => (
                    <tr
                      key={closedDate.id}
                      className={`border-b border-border transition ${
                        !closedDate.isActive ? "bg-gray-50/40" : "hover:bg-muted"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {formatDate(closedDate.closedDate)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {closedDate.reason || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            closedDate.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {closedDate.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(closedDate.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(closedDate.id)}
                            disabled={!!actionId}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            title="Delete"
                          >
                            {actionId === `delete-${closedDate.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </button>
                        </div>
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
