import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, ToggleLeft, ToggleRight, Calendar, AlertTriangle, Clock } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Format date string or Date object to readable format
 */
const formatDate = (dateInput) => {
  if (!dateInput) return "Invalid Date";
  try {
    let date;
    
    if (typeof dateInput === "string") {
      // Parse YYYY-MM-DD format manually to avoid timezone issues
      const [year, month, day] = dateInput.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return "Invalid Date";
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
};

/**
 * Check if a holiday is upcoming (on or after today)
 */
const isUpcomingHoliday = (dateInput) => {
  if (!dateInput) return false;
  
  try {
    let date;
    
    if (typeof dateInput === "string") {
      const [year, month, day] = dateInput.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return false;
    }
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Compare dates
    return date >= today;
  } catch (e) {
    return false;
  }
};

export default function HolidayManagement() {
  const [systemHolidays, setSystemHolidays] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [editingOverride, setEditingOverride] = useState(null);
  
  const [formData, setFormData] = useState({
    holidayUid: "",
    holidayDate: "",
    holidaySummary: "",
    isWorkingDate: false,
    reason: "",
    useCustomHours: false,
    customStartTime: "09:00",
    customEndTime: "17:00",
    customCapacity: null,
  });
  
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [holidaysRes, overridesRes] = await Promise.all([
        axios.get(`${API_URL}/holidays`),
        axios.get(`${API_URL}/holiday-overrides`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      console.log("Raw holidays data:", holidaysRes.data);
      if (holidaysRes.data && holidaysRes.data.length > 0) {
        console.log("First holiday:", holidaysRes.data[0]);
      }
      
      setSystemHolidays(holidaysRes.data || []);
      setOverrides(overridesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load holiday data");
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

  const handleToggleHoliday = (holiday) => {
    // Pre-fill the form with holiday data
    setFormData({
      holidayUid: holiday.uid,
      holidayDate: holiday.start || holiday.startDate, // Backend returns 'start'
      holidaySummary: holiday.summary,
      isWorkingDate: true, // Default to marking as working date
      reason: "",
      useCustomHours: false,
      customStartTime: "09:00",
      customEndTime: "17:00",
      customCapacity: null,
    });
    setShowOverrideForm(true);
  };

  const handleSubmitOverride = async (e) => {
    e.preventDefault();
    
    setValidationError("");

    if (!formData.holidayDate || !formData.holidayUid) {
      setValidationError("Missing required fields");
      return;
    }
    
    // Validate capacity is required when custom hours are enabled
    if (formData.useCustomHours && (!formData.customCapacity || formData.customCapacity <= 0)) {
      setValidationError("Capacity is required when using custom hours");
      return;
    }

    try {
      setActionId("submit");
      
      const payload = {
        holidayUid: formData.holidayUid,
        holidayDate: formData.holidayDate,
        holidaySummary: formData.holidaySummary,
        isWorkingDate: formData.isWorkingDate,
        reason: formData.reason.trim() || null,
        useCustomHours: formData.useCustomHours,
        customStartTime: formData.useCustomHours ? formData.customStartTime : null,
        customEndTime: formData.useCustomHours ? formData.customEndTime : null,
        customCapacity: formData.useCustomHours ? formData.customCapacity : null,
      };

      // If editing, use PUT to update; otherwise use POST to create
      if (editingOverride) {
        await axios.put(`${API_URL}/holiday-overrides/${editingOverride.id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success("Holiday override updated successfully");
      } else {
        await axios.post(`${API_URL}/holiday-overrides`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        toast.success(
          formData.isWorkingDate
            ? "Holiday marked as working date successfully"
            : "Holiday override created successfully"
        );
      }
      
      setFormData({
        holidayUid: "",
        holidayDate: "",
        holidaySummary: "",
        isWorkingDate: false,
        reason: "",
        useCustomHours: false,
        customStartTime: "09:00",
        customEndTime: "17:00",
        customCapacity: null,
      });
      setEditingOverride(null);
      setShowOverrideForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error saving override:", error);
      const errorMsg = error.response?.data?.message || "Failed to save holiday override";
      setValidationError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionId(null);
    }
  };

  const handleEditOverride = (override) => {
    setEditingOverride(override);
    setFormData({
      holidayUid: override.holidayUid,
      holidayDate: override.holidayDate,
      holidaySummary: override.holidaySummary,
      isWorkingDate: override.isWorkingDate,
      reason: override.reason || "",
      useCustomHours: override.useCustomHours || false,
      customStartTime: override.customStartTime || "09:00",
      customEndTime: override.customEndTime || "17:00",
      customCapacity: override.customCapacity || null,
    });
    setShowOverrideForm(true);
  };

  const handleDeleteOverride = async (overrideId) => {
    if (!window.confirm("Are you sure you want to remove this holiday override?"))
      return;

    try {
      setActionId(`delete-${overrideId}`);
      await axios.delete(`${API_URL}/holiday-overrides/${overrideId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Holiday override removed successfully");
      await fetchData();
    } catch (error) {
      console.error("Error deleting override:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete holiday override"
      );
    } finally {
      setActionId(null);
    }
  };

  const getOverrideStatus = (holiday) => {
    const holidayDate = holiday.start || holiday.startDate;
    const override = overrides.find((o) => o.holidayDate === holidayDate);
    if (!override) return null;
    return override;
  };

  const isHolidayOverridden = (holiday) => {
    const holidayDate = holiday.start || holiday.startDate;
    return overrides.some((o) => o.holidayDate === holidayDate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System Holidays Section */}
      <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">System Holidays</h2>
        </div>

        {systemHolidays.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No holidays available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Holiday Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {systemHolidays
                  .filter((holiday) => isUpcomingHoliday(holiday.start || holiday.startDate))
                  .map((holiday, idx) => {
                  const override = getOverrideStatus(holiday);
                  const isOverridden = !!override;

                  return (
                    <tr
                      key={idx}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-700">
                        {formatDate(holiday.start || holiday.startDate)}
                        {(holiday.end || holiday.endDate) &&
                          (holiday.end || holiday.endDate) !== (holiday.start || holiday.startDate) && (
                            <>
                              {" - "}
                              {formatDate(holiday.end || holiday.endDate)}
                            </>
                          )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {holiday.summary}
                      </td>
                      <td className="px-4 py-3">
                        {isOverridden ? (
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              override.isWorkingDate
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {override.isWorkingDate ? (
                              <>
                                <ToggleRight size={16} />
                                WORKING DATE
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={16} />
                                CLOSED
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            <AlertTriangle size={16} />
                            CLOSED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleHoliday(holiday)}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            isOverridden
                              ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          {isOverridden ? "Edit" : "Override"}
                        </button>
                        {isOverridden && (
                          <button
                            onClick={() => handleDeleteOverride(override.id)}
                            disabled={actionId === `delete-${override.id}`}
                            className="ml-2 px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                          >
                            {actionId === `delete-${override.id}` ? (
                              <Loader2 className="inline animate-spin mr-1" size={14} />
                            ) : (
                              <Trash2 className="inline mr-1" size={14} />
                            )}
                            Revert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Active Overrides Section */}
      {overrides.length > 0 && (
        <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <ToggleRight className="text-green-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Active Overrides</h2>
          </div>

          <div className="space-y-4">
            {overrides.map((override) => (
              <div
                key={override.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {override.holidaySummary}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          override.isWorkingDate
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {override.isWorkingDate ? "WORKING" : "CLOSED"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Date: {formatDate(override.holidayDate)}
                    </p>
                    {override.reason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {override.reason}
                      </p>
                    )}

                    {/* Custom Hours Display */}
                    {override.useCustomHours && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={16} className="text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Custom Hours
                          </span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p>
                            <strong>Time:</strong> {override.customStartTime} -{" "}
                            {override.customEndTime}
                          </p>
                          {override.customCapacity && (
                            <p>
                              <strong>Capacity:</strong> {override.customCapacity}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {override.createdBy && (
                      <p className="text-xs text-gray-500 mt-3">
                        Created by: {override.createdBy}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditOverride(override)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit override"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteOverride(override.id)}
                      disabled={actionId === `delete-${override.id}`}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete override"
                    >
                      {actionId === `delete-${override.id}` ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Holiday Override Form Modal */}
      {showOverrideForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              {editingOverride ? "Edit Holiday Override" : "Create Holiday Override"}
            </h3>

            {validationError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {validationError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitOverride} className="space-y-6">
              {/* Holiday Info (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Holiday:</strong> {formData.holidaySummary}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {formatDate(formData.holidayDate)}
                </p>
              </div>

              {/* Working Date Toggle */}
              <div>
                <label htmlFor="isWorkingDate" className="flex items-center gap-3 cursor-pointer">
                  <input
                    id="isWorkingDate"
                    type="checkbox"
                    name="isWorkingDate"
                    checked={formData.isWorkingDate}
                    onChange={handleFormChange}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-700">
                    Mark as WORKING DATE (Open)
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-2 ml-7">
                  If checked, salon will be open on this holiday date
                </p>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <input
                  id="reason"
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  placeholder="e.g., Low demand, special promotion..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Custom Hours Section */}
              <div className="border-t pt-6">
                <label htmlFor="useCustomHours" className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    id="useCustomHours"
                    type="checkbox"
                    name="useCustomHours"
                    checked={formData.useCustomHours}
                    onChange={handleFormChange}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-gray-700">
                    Use Custom Operating Hours
                  </span>
                </label>

                {formData.useCustomHours && (
                  <div className="space-y-4 pl-7 bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="customStartTime" className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          id="customStartTime"
                          type="time"
                          name="customStartTime"
                          value={formData.customStartTime}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="customEndTime" className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          id="customEndTime"
                          type="time"
                          name="customEndTime"
                          value={formData.customEndTime}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="customCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="customCapacity"
                        type="number"
                        name="customCapacity"
                        value={formData.customCapacity || ""}
                        onChange={handleFormChange}
                        min="1"
                        placeholder="Required: Enter capacity for this day"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Required: Specify staff capacity for this day
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowOverrideForm(false);
                    setEditingOverride(null);
                    setValidationError("");
                    setFormData({
                      holidayUid: "",
                      holidayDate: "",
                      holidaySummary: "",
                      isWorkingDate: false,
                      reason: "",
                      useCustomHours: false,
                      customStartTime: "09:00",
                      customEndTime: "17:00",
                      customCapacity: null,
                    });
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionId === "submit"}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {actionId === "submit" ? (
                    <Loader2 className="inline animate-spin mr-2" size={16} />
                  ) : editingOverride ? (
                    <>
                      <Edit2 className="inline mr-2" size={16} />
                      Update Override
                    </>
                  ) : (
                    <>
                      <Plus className="inline mr-2" size={16} />
                      Create Override
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
