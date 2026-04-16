import { adminService } from "@/services/api";
import { Calendar, Clock, User, CheckCircle, AlertCircle, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState([]);
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(true);

  const fetchUpcomingBookings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAppointments();
      const appointments = response?.data || [];
      setAllAppointments(appointments);
      
      console.log("Total appointments fetched:", appointments.length);
      console.log("All appointments:", appointments);

      // Filter based on showOnlyUpcoming state
      let filtered = appointments;
      if (showOnlyUpcoming) {
        filtered = appointments.filter(
          (apt) =>
            apt &&
            (apt.status === "PENDING" || apt.status === "CONFIRMED") &&
            apt.date &&
            apt.time
        );
        console.log("Filtered upcoming appointments:", filtered.length);
      }

      // Sort by appointment date and time (ascending)
      const sorted = filtered.sort((a, b) => {
        try {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        } catch (error) {
          console.error("Error sorting appointments:", error);
          return 0;
        }
      });

      setBookings(sorted);
      if (sorted.length === 0 && appointments.length > 0) {
        console.warn("No upcoming bookings found. Check appointment statuses:", 
          appointments.map(a => ({ id: a.id, status: a.status }))
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load upcoming bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  // Re-apply filter when showOnlyUpcoming changes
  useEffect(() => {
    if (allAppointments.length > 0) {
      let filtered = allAppointments;
      if (showOnlyUpcoming) {
        filtered = allAppointments.filter(
          (apt) =>
            apt &&
            (apt.status === "PENDING" || apt.status === "CONFIRMED") &&
            apt.date &&
            apt.time
        );
      }
      const sorted = filtered.sort((a, b) => {
        try {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        } catch (error) {
          return 0;
        }
      });
      setBookings(sorted);
    }
  }, [showOnlyUpcoming, allAppointments]);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return "N/A";
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="h-3 w-3" />;
      case "PENDING":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Group appointments by date
  const groupedByDate = bookings.reduce((groups, booking) => {
    if (!booking || !booking.date) return groups;
    if (!groups[booking.date]) {
      groups[booking.date] = [];
    }
    groups[booking.date].push(booking);
    return groups;
  }, {});

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Bookings
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOnlyUpcoming(!showOnlyUpcoming)}
            className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
            title="Toggle filter"
          >
            {showOnlyUpcoming ? "All" : "Upcoming only"}
          </button>
          <button
            onClick={fetchUpcomingBookings}
            disabled={loading}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="Refresh bookings"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full font-medium">
            {bookings.length} {showOnlyUpcoming ? "upcoming" : "total"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="border border-border rounded-lg p-4 bg-muted animate-pulse">
              <div className="h-4 bg-muted-foreground rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted-foreground rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground font-medium">No {showOnlyUpcoming ? "upcoming" : "total"} bookings</p>
          <p className="text-xs text-muted-foreground mt-1">
            {showOnlyUpcoming 
              ? "Try clicking 'All' to see all appointments" 
              : `Total appointments in database: ${allAppointments.length}`}
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {sortedDates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-2 px-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  {formatDate(date)}
                </h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {groupedByDate[date].length} appointment{groupedByDate[date].length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Appointments for this date */}
              <div className="space-y-1">
                {groupedByDate[date].map((booking) => {
                  if (!booking || !booking.id) return null;
                  const serviceName = booking.serviceName || "Service";
                  const customerName = booking.customerName || "Unknown";

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors text-sm"
                    >
                      {/* Time */}
                      <div className="w-16 font-medium text-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span>{booking.time ? formatTime(booking.time) : "N/A"}</span>
                      </div>

                      {/* Service */}
                      <div className="flex-1 text-foreground">
                        {serviceName}
                      </div>

                      {/* Customer Name */}
                      <div className="flex-1 text-muted-foreground flex items-center gap-1">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{customerName}</span>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status || "UNKNOWN"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
