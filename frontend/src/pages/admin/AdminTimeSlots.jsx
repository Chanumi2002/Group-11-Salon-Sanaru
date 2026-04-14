import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService } from "@/services/api";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";

const DAYS_OF_WEEK = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const getDayLabel = (day) => {
  const dayMap = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };
  return dayMap[day] || day;
};

const formatTime = (timeString) => {
  if (!timeString) return "—";
  const [hour, minute] = timeString.split(":");
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 || 12;
  return `${formattedHour}:${minute} ${ampm}`;
};

export default function AdminTimeSlots() {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formMode, setFormMode] = useState("single"); // "single" or "bulk"
  const [formData, setFormData] = useState({
    dayOfWeek: "MONDAY",
    startDay: "MONDAY",
    endDay: "FRIDAY",
    startTime: "09:00",
    endTime: "17:00",
    capacity: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllTimeSlots();
      // Sort by day of week
      const sorted = (response.data || []).sort((a, b) => {
        return DAYS_OF_WEEK.indexOf(a.dayOfWeek) - DAYS_OF_WEEK.indexOf(b.dayOfWeek);
      });
      setTimeSlots(sorted);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast.error(error.response?.data?.message || "Failed to load time slots");
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

  // Get day range from start to end day
  const getDayRange = (startDay, endDay) => {
    const start = DAYS_OF_WEEK.indexOf(startDay);
    const end = DAYS_OF_WEEK.indexOf(endDay);
    
    if (start > end) {
      return [...DAYS_OF_WEEK.slice(start), ...DAYS_OF_WEEK.slice(0, end + 1)];
    }
    return DAYS_OF_WEEK.slice(start, end + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.startTime >= formData.endTime) {
      toast.error("Start time must be before end time");
      return;
    }

    try {
      setActionId("submit");

      if (editingId) {
        // Single day update
        await adminService.updateTimeSlot(editingId, {
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          capacity: formData.capacity,
          isActive: formData.isActive,
        });
        toast.success("Time slot updated successfully");
      } else {
        // Bulk or single create
        if (formMode === "bulk") {
          const daysToCreate = getDayRange(formData.startDay, formData.endDay);
          let successCount = 0;
          
          for (const day of daysToCreate) {
            try {
              await adminService.createTimeSlot({
                dayOfWeek: day,
                startTime: formData.startTime,
                endTime: formData.endTime,
                capacity: formData.capacity,
                isActive: formData.isActive,
              });
              successCount++;
            } catch (err) {
              console.error(`Error creating slot for ${day}:`, err);
            }
          }
          
          toast.success(`Created ${successCount} time slot(s) successfully`);
        } else {
          // Single day create
          await adminService.createTimeSlot({
            dayOfWeek: formData.dayOfWeek,
            startTime: formData.startTime,
            endTime: formData.endTime,
            capacity: formData.capacity,
            isActive: formData.isActive,
          });
          toast.success("Time slot created successfully");
        }
      }

      // Reset form
      setFormData({
        dayOfWeek: "MONDAY",
        startDay: "MONDAY",
        endDay: "FRIDAY",
        startTime: "09:00",
        endTime: "17:00",
        capacity: 1,
        isActive: true,
      });
      setEditingId(null);
      setFormMode("single");
      setShowForm(false);

      await fetchTimeSlots();
    } catch (error) {
      console.error("Error saving time slot:", error);
      toast.error(error.response?.data?.message || "Failed to save time slot");
    } finally {
      setActionId(null);
    }
  };

  const handleQuickPreset = async (presetName) => {
    const presets = {
      "weekdays-9-5": {
        days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        startTime: "09:00",
        endTime: "17:00",
      },
      "weekdays-9-6": {
        days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        startTime: "09:00",
        endTime: "18:00",
      },
      "all-days-10-6": {
        days: DAYS_OF_WEEK,
        startTime: "10:00",
        endTime: "18:00",
      },
      "weekdays-10-5-sat-11-4": {
        days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        startTime: "10:00",
        endTime: "17:00",
      },
    };

    const preset = presets[presetName];
    if (!preset) return;

    try {
      setActionId("preset");
      let successCount = 0;

      for (const day of preset.days) {
        try {
          await adminService.createTimeSlot({
            dayOfWeek: day,
            startTime: preset.startTime,
            endTime: preset.endTime,
            capacity: 1,
            isActive: true,
          });
          successCount++;
        } catch (err) {
          console.error(`Error creating slot for ${day}:`, err);
        }
      }

      toast.success(`Quick setup complete! Created ${successCount} time slot(s)`);
      await fetchTimeSlots();
    } catch (error) {
      console.error("Error applying preset:", error);
      toast.error("Failed to apply quick preset");
    } finally {
      setActionId(null);
    }
  };

  const handleEdit = (slot) => {
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity || 1,
      isActive: slot.isActive,
    });
    setEditingId(slot.id);
    setShowForm(true);
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this time slot?")) return;

    try {
      setActionId(`delete-${slotId}`);
      await adminService.deleteTimeSlot(slotId);
      toast.success("Time slot deleted successfully");
      await fetchTimeSlots();
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast.error(error.response?.data?.message || "Failed to delete time slot");
    } finally {
      setActionId(null);
    }
  };

  const handleToggle = async (slotId) => {
    try {
      setActionId(`toggle-${slotId}`);
      await adminService.toggleTimeSlot(slotId);
      toast.success("Time slot status updated");
      await fetchTimeSlots();
    } catch (error) {
      console.error("Error toggling time slot:", error);
      toast.error(error.response?.data?.message || "Failed to update time slot");
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormMode("single");
    setFormData({
      dayOfWeek: "MONDAY",
      startDay: "MONDAY",
      endDay: "FRIDAY",
      startTime: "09:00",
      endTime: "17:00",
      capacity: 1,
      isActive: true,
    });
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Time Slot Management</h1>
          <p className="text-muted-foreground">
            Define operating hours and manage available booking time slots for your salon.
          </p>
        </div>

        {/* Quick Preset section */}
        {!showForm && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Quick Setup</h2>
              <p className="text-sm text-blue-700 mb-4">Instantly create multiple time slots for a typical salon schedule:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => handleQuickPreset("weekdays-9-5")}
                  disabled={!!actionId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
                >
                  {actionId === "preset" ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Setting up...
                    </div>
                  ) : (
                    "Mon-Fri 9AM-5PM"
                  )}
                </button>
                <button
                  onClick={() => handleQuickPreset("weekdays-9-6")}
                  disabled={!!actionId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
                >
                  {actionId === "preset" ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Setting up...
                    </div>
                  ) : (
                    "Mon-Fri 9AM-6PM"
                  )}
                </button>
                <button
                  onClick={() => handleQuickPreset("all-days-10-6")}
                  disabled={!!actionId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
                >
                  {actionId === "preset" ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Setting up...
                    </div>
                  ) : (
                    "All Days 10AM-6PM"
                  )}
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                >
                  Custom Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="mb-8 bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {editingId ? "Edit Time Slot" : "Create New Time Slot"}
            </h2>

            {!editingId && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-foreground mb-3">Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="single"
                      checked={formMode === "single"}
                      onChange={(e) => setFormMode(e.target.value)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-foreground">Single Day</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="bulk"
                      checked={formMode === "bulk"}
                      onChange={(e) => setFormMode(e.target.value)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-foreground">Multiple Days (Range)</span>
                  </label>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`grid gap-4 ${formMode === "single" ? "grid-cols-1 md:grid-cols-5" : "grid-cols-1 md:grid-cols-6"}`}>
                {/* Single Day Mode */}
                {formMode === "single" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Day</label>
                    <select
                      name="dayOfWeek"
                      value={formData.dayOfWeek}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {getDayLabel(day)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bulk Mode - Start Day */}
                {formMode === "bulk" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Start Day</label>
                    <select
                      name="startDay"
                      value={formData.startDay}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {getDayLabel(day)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bulk Mode - End Day */}
                {formMode === "bulk" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">End Day</label>
                    <select
                      name="endDay"
                      value={formData.endDay}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <option key={day} value={day}>
                          {getDayLabel(day)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Capacity - Number of concurrent appointments */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    min="1"
                    max="20"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Beauticians/slots</p>
                </div>

                {/* Active Toggle - only shown when editing */}
                {editingId && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Active</label>
                    <div className="flex items-center h-10">
                      <input
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
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={!!actionId}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {actionId === "submit" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingId ? "Update Slot" : formMode === "bulk" ? "Create Multiple Slots" : "Create Slot"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg px-4 py-2 bg-muted text-foreground font-medium hover:bg-muted/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add New Slot Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
            >
              <Plus className="h-4 w-4" />
              Add Time Slot
            </button>
          </div>
        )}

        {/* Time Slots Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading time slots…</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No time slots configured yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-primary hover:underline font-medium"
              >
                Create your first time slot
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    {["Day", "Start Time", "End Time", "Capacity", "Status", "Actions"].map((h) => (
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
                  {timeSlots.map((slot) => (
                    <tr
                      key={slot.id}
                      className={`border-b border-border transition ${
                        !slot.isActive ? "bg-gray-50/40" : "hover:bg-muted"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {getDayLabel(slot.dayOfWeek)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatTime(slot.startTime)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatTime(slot.endTime)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          👥 {slot.capacity || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            slot.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {slot.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(slot.id)}
                            disabled={!!actionId}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition disabled:opacity-50"
                            title={slot.isActive ? "Deactivate" : "Activate"}
                          >
                            {actionId === `toggle-${slot.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : slot.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(slot)}
                            disabled={!!actionId}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                            title="Edit"
                          >
                            {actionId === `edit-${slot.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            disabled={!!actionId}
                            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                            title="Delete"
                          >
                            {actionId === `delete-${slot.id}` ? (
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
