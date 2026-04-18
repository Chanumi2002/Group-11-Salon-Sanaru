import { AdminDashboardLayout } from "@/components/common/AdminDashboardLayout";
import { adminService, closedDateService } from "@/services/api";
import HolidayManagement from "@/components/HolidayManagement";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Loader2, ToggleLeft, ToggleRight, Calendar, AlertTriangle, Check, X } from "lucide-react";

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
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formMode, setFormMode] = useState("single"); // "single" or "bulk"
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [showBreakForm, setShowBreakForm] = useState(false);
  const [closedDates, setClosedDates] = useState([]);
  const [showClosedDateForm, setShowClosedDateForm] = useState(false);
  const [closedDateFormData, setClosedDateFormData] = useState({
    closedDate: "",
    reason: "",
    isActive: true,
  });
  const [breakData, setBreakData] = useState({
    breakName: "Lunch",
    startTime: "13:00",
    endTime: "14:00",
  });
  const [breaksToAdd, setBreaksToAdd] = useState([]); // Breaks to add with new time slot
  const [breakFormRows, setBreakFormRows] = useState([
    { breakName: "", startTime: "", endTime: "" }
  ]); // Multiple break input rows
  const [showTempBreakForm, setShowTempBreakForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false); // Toggle form visibility
  const [editingBreakId, setEditingBreakId] = useState(null); // For editing existing breaks
  const [formData, setFormData] = useState({
    dayOfWeek: "MONDAY",
    startDay: "MONDAY",
    endDay: "FRIDAY",
    startTime: "09:00",
    endTime: "17:00",
    capacity: 1,
    appointmentDuration: 30,
    isActive: true,
  });

  useEffect(() => {
    fetchTimeSlots();
    fetchClosedDates();
  }, []);

  const fetchClosedDates = async () => {
    try {
      const response = await closedDateService.getAllClosedDates();
      // Sort by date
      const sorted = (response.data || []).sort((a, b) => {
        return new Date(a.closedDate) - new Date(b.closedDate);
      });
      setClosedDates(sorted);
    } catch (error) {
      console.error("Error fetching closed dates:", error);
      toast.error("Failed to load closed dates");
    }
  };

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
      setActionId(editingId ? "save" : "submit");

      if (editingId) {
        // Single day update
        await adminService.updateTimeSlot(editingId, {
          dayOfWeek: formData.dayOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          capacity: formData.capacity,
          appointmentDuration: formData.appointmentDuration,
          isActive: formData.isActive,
        });
        toast.success("Time slot updated successfully");
      } else {
        // Bulk or single create
        let createdSlotIds = [];
        
        if (formMode === "bulk") {
          const daysToCreate = getDayRange(formData.startDay, formData.endDay);
          
          for (const day of daysToCreate) {
            try {
              const response = await adminService.createTimeSlot({
                dayOfWeek: day,
                startTime: formData.startTime,
                endTime: formData.endTime,
                capacity: formData.capacity,
                appointmentDuration: formData.appointmentDuration,
                isActive: formData.isActive,
              });
              createdSlotIds.push(response.data?.id);
            } catch (err) {
              console.error(`Error creating slot for ${day}:`, err);
            }
          }
          
          toast.success(`Created ${createdSlotIds.length} time slot(s) successfully`);
        } else {
          // Single day create
          const response = await adminService.createTimeSlot({
            dayOfWeek: formData.dayOfWeek,
            startTime: formData.startTime,
            endTime: formData.endTime,
            capacity: formData.capacity,
            appointmentDuration: formData.appointmentDuration,
            isActive: formData.isActive,
          });
          createdSlotIds.push(response.data?.id);
          toast.success("Time slot created successfully");
        }

        // Add breaks to all newly created slots
        if (breaksToAdd.length > 0 && createdSlotIds.length > 0) {
          let breakSuccessCount = 0;
          for (const slotId of createdSlotIds) {
            for (const breakItem of breaksToAdd) {
              try {
                await adminService.addBreak(slotId, {
                  breakName: breakItem.breakName,
                  startTime: breakItem.startTime,
                  endTime: breakItem.endTime,
                  isActive: true,
                });
                breakSuccessCount++;
              } catch (err) {
                console.error(`Error adding break to slot ${slotId}:`, err);
              }
            }
          }
          if (breakSuccessCount > 0) {
            toast.success(`Added ${breakSuccessCount} break(s)`);
          }
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
        appointmentDuration: 30,
        isActive: true,
      });
      setBreaksToAdd([]);
      setBreakFormRows([{ breakName: "", startTime: "", endTime: "" }]);
      setShowBreakForm(false);
      setEditingId(null);
      setShowEditModal(false);
      setShowCreateForm(false);
      setFormMode("single");

      await fetchTimeSlots();
    } catch (error) {
      console.error("Error saving time slot:", error);
      toast.error(error.response?.data?.message || "Failed to save time slot");
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
      appointmentDuration: slot.appointmentDuration || 30,
      isActive: slot.isActive,
    });
    setEditingId(slot.id);
    setSelectedSlotId(slot.id);
    setFormMode("single"); // Reset to single mode for editing
    setShowEditModal(true); // Show modal instead of showing form on page
  };

  const handleDelete = (slotId) => {
    const DeleteConfirmation = () => (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Delete Time Slot?</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This action cannot be undone. You will lose this time slot permanently.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                setActionId(`delete-${slotId}`);
                await adminService.deleteTimeSlot(slotId);
                toast.success("✓ Time slot deleted successfully", {
                  description: "The time slot has been removed.",
                  icon: <Check className="h-5 w-5 text-green-500" />,
                });
                await fetchTimeSlots();
              } catch (error) {
                console.error("Error deleting time slot:", error);
                toast.error(error.response?.data?.message || "Failed to delete time slot");
              } finally {
                setActionId(null);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    );

    toast.custom((t) => <DeleteConfirmation />, {
      duration: 6000,
      style: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      },
    });
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
    setEditingId(null);
    setShowEditModal(false);
    setShowCreateForm(false);
    setFormMode("single");
    setFormData({
      dayOfWeek: "MONDAY",
      startDay: "MONDAY",
      endDay: "FRIDAY",
      startTime: "09:00",
      endTime: "17:00",
      capacity: 1,
      appointmentDuration: 30,
      isActive: true,
    });
    setBreaksToAdd([]);
    setBreakFormRows([{ breakName: "", startTime: "", endTime: "" }]);
    setShowTempBreakForm(false);
    setEditingBreakId(null);
    setShowBreakForm(false);
    setBreakData({
      breakName: "Lunch",
      startTime: "13:00",
      endTime: "14:00",
    });
  };

  const handleClosedDateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClosedDateFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddClosedDate = async (e) => {
    e.preventDefault();

    if (!closedDateFormData.closedDate) {
      toast.error("Please select a date");
      return;
    }

    // Check if date is in the past (safely comparing dates without timezone issues)
    const [year, month, day] = closedDateFormData.closedDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // month is 0-indexed in JS
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Cannot add closed date in the past");
      return;
    }

    try {
      setActionId("addClosedDate");
      await closedDateService.addClosedDate({
        closedDate: closedDateFormData.closedDate,
        reason: closedDateFormData.reason.trim() || "Closed",
        isActive: closedDateFormData.isActive,
      });

      toast.success("Closed date added successfully");
      setClosedDateFormData({ closedDate: "", reason: "", isActive: true });
      setShowClosedDateForm(false);
      await fetchClosedDates();
    } catch (error) {
      console.error("Error adding closed date:", error);
      const errorMessage = error.response?.data?.message || error.response?.data || "Failed to add closed date";
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Failed to add closed date");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteClosedDate = async (dateId) => {
    if (!window.confirm("Are you sure you want to remove this closed date?")) return;

    try {
      setActionId(`deleteClosedDate-${dateId}`);
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

  const handleAddBreak = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // If we're editing a break, call handleUpdateBreak instead
    if (editingBreakId) {
      return handleUpdateBreak(e || {preventDefault: () => {}});
    }

    if (breakData.startTime >= breakData.endTime) {
      toast.error("Break start time must be before end time");
      return;
    }

    if (!breakData.breakName.trim()) {
      toast.error("Please enter a break name");
      return;
    }

    try {
      setActionId("addBreak");
      const slotIdToUse = editingId || selectedSlotId;
      
      if (!slotIdToUse) {
        toast.error("No time slot selected");
        return;
      }

      await adminService.addBreak(slotIdToUse, {
        breakName: breakData.breakName,
        startTime: breakData.startTime,
        endTime: breakData.endTime,
        isActive: true,
      });
      
      toast.success("Break added successfully");
      setBreakData({ breakName: "Lunch", startTime: "13:00", endTime: "14:00" });
      setShowBreakForm(false);
      
      // Refresh time slots to get the updated break list
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchTimeSlots();
    } catch (error) {
      console.error("Error adding break:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to add break";
      toast.error(errorMsg);
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteBreak = async (breakId) => {
    if (!window.confirm("Are you sure you want to delete this break?")) return;

    try {
      setActionId(`deleteBreak-${breakId}`);
      const slotIdToUse = editingId || selectedSlotId;
      
      if (!slotIdToUse) {
        toast.error("No time slot selected");
        return;
      }

      await adminService.deleteBreak(slotIdToUse, breakId);
      toast.success("Break deleted successfully");
      await fetchTimeSlots();
    } catch (error) {
      console.error("Error deleting break:", error);
      toast.error(error.response?.data?.message || "Failed to delete break");
    } finally {
      setActionId(null);
    }
  };

  const handleEditBreak = (breakItem) => {
    setEditingBreakId(breakItem.id);
    setBreakData({
      breakName: breakItem.breakName,
      startTime: breakItem.startTime.substring(0, 5),
      endTime: breakItem.endTime.substring(0, 5),
    });
    setShowBreakForm(true);
  };

  const handleUpdateBreak = async (e) => {
    e.preventDefault();

    const slotIdToUse = editingId || selectedSlotId;
    
    if (!slotIdToUse) {
      toast.error("No time slot selected");
      return;
    }

    if (!breakData.breakName || !breakData.startTime || !breakData.endTime) {
      toast.error("Please fill in all break fields");
      return;
    }

    if (breakData.startTime >= breakData.endTime) {
      toast.error("Break start time must be before end time");
      return;
    }

    try {
      setActionId("updateBreak");
      await adminService.updateBreak(slotIdToUse, editingBreakId, {
        breakName: breakData.breakName,
        startTime: breakData.startTime,
        endTime: breakData.endTime,
      });
      toast.success("Break updated successfully");
      setEditingBreakId(null);
      setBreakData({
        breakName: "Lunch",
        startTime: "13:00",
        endTime: "14:00",
      });
      setShowBreakForm(false);
      await fetchTimeSlots();
    } catch (error) {
      console.error("Error updating break:", error);
      toast.error(error.response?.data?.message || "Failed to update break");
    } finally {
      setActionId(null);
    }
  };

  const handleBreakFormChange = (e) => {
    const { name, value } = e.target;
    setBreakData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTempBreakFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...breakFormRows];
    updatedRows[index] = {
      ...updatedRows[index],
      [name]: value,
    };
    setBreakFormRows(updatedRows);
  };

  const handleAddBreakRow = (index) => {
    // Just add a new empty row, don't validate or add to list
    setBreakFormRows([...breakFormRows, { breakName: "", startTime: "", endTime: "" }]);
  };

  const handleConfirmBreak = (index) => {
    const currentRow = breakFormRows[index];

    // Validate current row before adding to list
    if (!currentRow.breakName.trim()) {
      toast.error("Break name is required");
      return;
    }

    if (currentRow.startTime >= currentRow.endTime) {
      toast.error("Break start time must be before end time");
      return;
    }

    if (currentRow.startTime < formData.startTime || currentRow.endTime > formData.endTime) {
      toast.error("Break must be within the time slot hours");
      return;
    }

    // Add to breaks list
    setBreaksToAdd([...breaksToAdd, currentRow]);
    
    // Clear this row
    const updatedRows = breakFormRows.map((row, i) =>
      i === index ? { breakName: "", startTime: "", endTime: "" } : row
    );
    setBreakFormRows(updatedRows);
    toast.success(`"${currentRow.breakName}" added to breaks list`);
  };

  const handleAddMoreBreakRows = () => {
    setBreakFormRows([...breakFormRows, { breakName: "", startTime: "", endTime: "" }]);
  };

  const handleRemoveBreakRow = (index) => {
    if (breakFormRows.length > 1) {
      setBreakFormRows(breakFormRows.filter((_, i) => i !== index));
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
        {/* Top Section: Heading and Closed Dates in Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Time Slot Management */}
          <div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Time Slot Management</h1>
              <p className="text-muted-foreground">
                Define operating hours and manage available booking time slots for your salon.
              </p>
            </div>

            {/* Create Slot Button */}
            {!editingId && !showCreateForm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 rounded-lg px-6 py-3 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                >
                  <Plus className="h-5 w-5" />
                  Create Time Slot
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Closed Dates */}
          <div>
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 h-full">
              <h2 className="text-lg font-semibold text-rose-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Closed Dates & Holidays
              </h2>
              <p className="text-sm text-rose-700 mb-4">
                Mark specific dates when your salon is closed (holidays, special events, maintenance, etc.).
              </p>

              {!showClosedDateForm ? (
                <button
                  onClick={() => setShowClosedDateForm(true)}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition hover:shadow-md hover:scale-105 font-medium text-sm"
                >
                  + Add Closed Date
                </button>
              ) : (
                <form onSubmit={handleAddClosedDate} className="space-y-4 bg-white p-4 rounded-lg border border-rose-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label htmlFor="closedDate" className="block text-sm font-semibold text-foreground mb-2 group-hover:text-rose-600 transition">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="closedDate"
                        type="date"
                        name="closedDate"
                        value={closedDateFormData.closedDate}
                        onChange={handleClosedDateFormChange}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent hover:shadow-sm"
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="closedReason" className="block text-sm font-semibold text-foreground mb-2 group-hover:text-rose-600 transition">
                        Reason <span className="text-gray-500">(Optional)</span>
                      </label>
                      <input
                        id="closedReason"
                        type="text"
                        name="reason"
                        value={closedDateFormData.reason}
                        onChange={handleClosedDateFormChange}
                        placeholder="e.g., Public Holiday, Maintenance"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent hover:shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={!!actionId}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:hover:shadow-none font-medium text-sm"
                    >
                      {actionId === "addClosedDate" ? (
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
                      onClick={() => setShowClosedDateForm(false)}
                      className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition hover:shadow-md hover:scale-105 font-medium text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Closed Dates List */}
              {closedDates.length > 0 ? (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {closedDates.map((closedDate) => (
                    <div
                      key={closedDate.id}
                      className={`flex items-center justify-between p-3 rounded-lg border text-sm transition hover:shadow-md hover:scale-[1.02] ${
                        closedDate.isActive
                          ? "bg-rose-100 border-rose-300 hover:bg-rose-200"
                          : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {formatDate(closedDate.closedDate)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {closedDate.reason ? `${closedDate.reason}` : "—"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteClosedDate(closedDate.id)}
                        disabled={!!actionId}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100 hover:text-red-700 transition hover:scale-110 disabled:opacity-50 disabled:scale-100 ml-3"
                        title="Delete"
                      >
                        {actionId === `deleteClosedDate-${closedDate.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600 hover:text-red-700" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-rose-600 italic mt-3">No closed dates added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Unified Form Section - Only Visible When NOT Editing and Form is Shown */}
        {!editingId && showCreateForm && (
          <div className="mb-8 bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground">
              {editingId ? "Edit Time Slot" : "Create Time Slot & Add Breaks"}
            </h2>

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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* TIME SLOT SECTION */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">⏰ Time Slot Details</h3>
                <div className={`grid gap-4 ${editingId ? "grid-cols-1 md:grid-cols-5" : (formMode === "single" ? "grid-cols-1 md:grid-cols-5" : "grid-cols-1 md:grid-cols-6")}`}>
                {/* Single Day Mode */}
                {formMode === "single" && (
                  <div>
                    <label htmlFor="dayOfWeek" className="block text-sm font-medium text-foreground mb-2">Day</label>
                    <select
                      id="dayOfWeek"
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
                    <label htmlFor="startDay" className="block text-sm font-medium text-foreground mb-2">Start Day</label>
                    <select
                      id="startDay"
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
                    <label htmlFor="endDay" className="block text-sm font-medium text-foreground mb-2">End Day</label>
                    <select
                      id="endDay"
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
                  <label htmlFor="startTime" className="block text-sm font-medium text-foreground mb-2">Start Time</label>
                  <input
                    id="startTime"
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-foreground mb-2">End Time</label>
                  <input
                    id="endTime"
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Capacity - Number of concurrent appointments */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-foreground mb-2">Capacity</label>
                  <input
                    id="capacity"
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

                {/* Appointment Duration - Time period for each booking */}
                <div>
                  <label htmlFor="appointmentDuration" className="block text-sm font-medium text-foreground mb-2">Appointment Duration</label>
                  <select
                    id="appointmentDuration"
                    name="appointmentDuration"
                    value={formData.appointmentDuration}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour (60 min)</option>
                    <option value={90}>1.5 hours (90 min)</option>
                    <option value={120}>2 hours (120 min)</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Duration per customer booking</p>
                </div>

                {/* Active Toggle - only shown when editing */}
                {editingId && (
                  <div>
                    <label htmlFor="isActive" className="block text-sm font-medium text-foreground mb-2">Active</label>
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
                )}
              </div>
              </div>

              {/* BREAKS SECTION - When creating new slot (not editing) */}
              {!editingId && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">☕ Add Breaks (Optional)</h3>
                  <p className="text-xs text-muted-foreground mb-4">Add lunch breaks, prayer time, coffee breaks, or other breaks during this time slot.</p>

                  <div className="space-y-4">
                    {/* Break Input Rows - One row per break */}
                    {breakFormRows.map((row, index) => (
                      <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-5">
                            <label className="block text-xs font-medium text-foreground mb-1">Break Name</label>
                            <input
                              type="text"
                              name="breakName"
                              value={row.breakName}
                              onChange={(e) => handleTempBreakFormChange(index, e)}
                              placeholder="e.g., Lunch, Prayer, Coffee"
                              className="w-full rounded border border-input bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-foreground mb-1">Start Time</label>
                            <input
                              type="time"
                              name="startTime"
                              value={row.startTime}
                              onChange={(e) => handleTempBreakFormChange(index, e)}
                              className="w-full rounded border border-input bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-medium text-foreground mb-1">End Time</label>
                            <input
                              type="time"
                              name="endTime"
                              value={row.endTime}
                              onChange={(e) => handleTempBreakFormChange(index, e)}
                              className="w-full rounded border border-input bg-background px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="col-span-1 flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleConfirmBreak(index)}
                              className="flex-1 flex items-center justify-center rounded px-2 py-2 bg-green-600 text-white hover:bg-green-700 transition text-xs font-semibold"
                              title="Add this break to list"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddBreakRow(index)}
                              className="flex-1 flex items-center justify-center rounded px-2 py-2 bg-amber-600 text-white hover:bg-amber-700 transition"
                              title="Add another break row"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            {breakFormRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBreakRow(index)}
                                className="flex-1 flex items-center justify-center rounded px-2 py-2 bg-red-100 text-red-600 hover:bg-red-200 transition"
                                title="Remove this row"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Added breaks list preview */}
                    {breaksToAdd.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-xs font-medium text-green-900 mb-2">✓ Breaks to be added:</p>
                        <div className="space-y-2">
                          {breaksToAdd.map((brk, index) => (
                            <div key={index} className="flex items-center justify-between bg-white rounded p-2 border border-green-100">
                              <div className="text-sm text-foreground">
                                <span className="font-medium">{brk.breakName}</span>
                                <span className="text-muted-foreground ml-2">({brk.startTime} - {brk.endTime})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setBreaksToAdd(breaksToAdd.filter((_, i) => i !== index))}
                                className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 transition"
                                title="Remove break"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

        {/* Breaks Management Section - Only shown when editing */}
        {editingId && (
          <div className="mb-8 bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Lunch Breaks & Other Breaks ☕</h3>
                <p className="text-sm text-muted-foreground mb-4">Add breaks like lunch, coffee, or prayer time when no appointments can be booked.</p>

                {/* Add Break Form */}
                {!showBreakForm ? (
                  <button
                    type="button"
                    onClick={() => setShowBreakForm(true)}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 bg-amber-600 text-white font-medium hover:bg-amber-700 transition mb-4"
                  >
                    <Plus className="h-4 w-4" />
                    Add Break
                  </button>
                ) : (
                  <form onSubmit={handleAddBreak} className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label htmlFor="breakName" className="block text-sm font-medium text-foreground mb-1">Break Name</label>
                        <input
                          id="breakName"
                          type="text"
                          name="breakName"
                          value={breakData.breakName}
                          onChange={handleBreakFormChange}
                          placeholder="e.g., Lunch, Coffee"
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="breakStartTime" className="block text-sm font-medium text-foreground mb-1">Start Time</label>
                        <input
                          id="breakStartTime"
                          type="time"
                          name="startTime"
                          value={breakData.startTime}
                          onChange={handleBreakFormChange}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="breakEndTime" className="block text-sm font-medium text-foreground mb-1">End Time</label>
                        <input
                          id="breakEndTime"
                          type="time"
                          name="endTime"
                          value={breakData.endTime}
                          onChange={handleBreakFormChange}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <button
                          type="submit"
                          disabled={!!actionId}
                          className="flex items-center gap-1 rounded-lg px-4 py-2 bg-amber-600 text-white font-medium hover:bg-amber-700 transition disabled:opacity-50 flex-1"
                        >
                          {actionId === "addBreak" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBreakForm(false)}
                          className="rounded-lg px-4 py-2 bg-gray-300 text-foreground font-medium hover:bg-gray-400 transition flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Breaks List */}
                {timeSlots.find((s) => s.id === editingId)?.breaks && timeSlots.find((s) => s.id === editingId).breaks.length > 0 ? (
                  <div className="space-y-2">
                    {timeSlots.find((s) => s.id === editingId).breaks.map((breakItem) => (
                      <div key={breakItem.id} className="bg-amber-100 border border-amber-300 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{breakItem.breakName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(breakItem.startTime)} - {formatTime(breakItem.endTime)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteBreak(breakItem.id)}
                          disabled={!!actionId}
                          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                          title="Delete Break"
                        >
                          {actionId === `deleteBreak-${breakItem.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-600" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No breaks added yet.</p>
                )}
              </div>
            )}
          </div>

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
              <p className="mt-4 text-primary font-medium">
                Scroll up to the form above to create your first time slot.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    {["Day", "Start Time", "End Time", "Capacity", "Duration", "Breaks", "Status", "Actions"].map((h) => (
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                          ⏱️ {slot.appointmentDuration || 60}min
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {slot.breaks && slot.breaks.length > 0 ? (
                          <div className="space-y-1">
                            {slot.breaks.map((brk) => (
                              <div key={brk.id} className="text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 text-amber-900">
                                <span className="font-medium">{brk.breakName}</span>
                                <span className="text-amber-700 ml-1">({formatTime(brk.startTime)} - {formatTime(brk.endTime)})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">—</span>
                        )}
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

        {/* HOLIDAY MANAGEMENT SECTION */}
        <div className="mt-12">
          <HolidayManagement />
        </div>

        {/* EDIT MODAL - Appears When Editing */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={handleCancel}>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg p-6 max-w-2xl w-11/12 max-h-[90vh] overflow-y-auto z-50" onClick={(e) => e.stopPropagation()}>
              {/* Close Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Edit Time Slot</h2>
                <button
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground transition text-2xl font-light"
                >
                  ×
                </button>
              </div>

              {/* Form in Modal */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* TIME SLOT SECTION */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">⏰ Time Slot Details</h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
                    {/* Day (Single Mode for Edit) */}
                    <div>
                      <label htmlFor="dayOfWeek-modal" className="block text-sm font-medium text-foreground mb-2">Day</label>
                      <select
                        id="dayOfWeek-modal"
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

                    {/* Start Time */}
                    <div>
                      <label htmlFor="startTime-modal" className="block text-sm font-medium text-foreground mb-2">Start Time</label>
                      <input
                        id="startTime-modal"
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleFormChange}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label htmlFor="endTime-modal" className="block text-sm font-medium text-foreground mb-2">End Time</label>
                      <input
                        id="endTime-modal"
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleFormChange}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Capacity */}
                    <div>
                      <label htmlFor="capacity-modal" className="block text-sm font-medium text-foreground mb-2">Capacity</label>
                      <input
                        id="capacity-modal"
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

                    {/* Appointment Duration */}
                    <div>
                      <label htmlFor="appointmentDuration-modal" className="block text-sm font-medium text-foreground mb-2">Duration</label>
                      <select
                        id="appointmentDuration-modal"
                        name="appointmentDuration"
                        value={formData.appointmentDuration}
                        onChange={handleFormChange}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="mt-4">
                    <label htmlFor="isActive-modal" className="block text-sm font-medium text-foreground mb-2">Status</label>
                    <div className="flex items-center h-10">
                      <input
                        id="isActive-modal"
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

                  {/* Breaks Display */}
                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-start justify-between mb-3">
                      <label className="block text-sm font-medium text-foreground">Breaks</label>
                      <button
                        type="button"
                        onClick={() => setShowBreakForm(!showBreakForm)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>

                    {/* Break Form */}
                    {showBreakForm && (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                          <div>
                            <label htmlFor="breakName-modal" className="block text-xs font-medium text-foreground mb-1">Break Name</label>
                            <input
                              id="breakName-modal"
                              type="text"
                              name="breakName"
                              value={breakData.breakName}
                              onChange={handleBreakFormChange}
                              placeholder="e.g., Lunch"
                              className="w-full rounded-lg border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label htmlFor="breakStartTime-modal" className="block text-xs font-medium text-foreground mb-1">Start</label>
                            <input
                              id="breakStartTime-modal"
                              type="time"
                              name="startTime"
                              value={breakData.startTime}
                              onChange={handleBreakFormChange}
                              className="w-full rounded-lg border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label htmlFor="breakEndTime-modal" className="block text-xs font-medium text-foreground mb-1">End</label>
                            <input
                              id="breakEndTime-modal"
                              type="time"
                              name="endTime"
                              value={breakData.endTime}
                              onChange={handleBreakFormChange}
                              className="w-full rounded-lg border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddBreak({preventDefault: () => {}})}
                            disabled={!!actionId}
                            className="flex items-center gap-1 rounded-lg px-3 py-1 bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition disabled:opacity-50 flex-1"
                          >
                            {actionId === "addBreak" || actionId === "updateBreak" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            {editingBreakId ? "Update Break" : "Add Break"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowBreakForm(false);
                              setEditingBreakId(null);
                              setBreakData({
                                breakName: "Lunch",
                                startTime: "13:00",
                                endTime: "14:00",
                              });
                            }}
                            className="rounded-lg px-3 py-1 bg-gray-200 text-foreground text-sm font-medium hover:bg-gray-300 transition flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Breaks List */}
                    {timeSlots.find((s) => s.id === editingId)?.breaks && timeSlots.find((s) => s.id === editingId).breaks.length > 0 ? (
                      <div className="space-y-2">
                        {timeSlots.find((s) => s.id === editingId).breaks.map((breakItem) => (
                          <div key={breakItem.id} className="bg-amber-100 border border-amber-300 rounded-lg p-2 flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium text-foreground">{breakItem.breakName}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(breakItem.startTime)} - {formatTime(breakItem.endTime)}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditBreak(breakItem)}
                                disabled={!!actionId}
                                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-blue-50 transition disabled:opacity-50"
                                title="Edit Break"
                              >
                                {actionId === `editBreak-${breakItem.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Edit2 className="h-4 w-4 text-blue-600" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBreak(breakItem.id)}
                                disabled={!!actionId}
                                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                                title="Delete Break"
                              >
                                {actionId === `deleteBreak-${breakItem.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No breaks added</p>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-100 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!!actionId}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 font-medium text-sm"
                  >
                    {actionId === "save" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </AdminDashboardLayout>
  );
}
