import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '@/services/api';
import { toast } from 'sonner';
import { Calendar, Clock, User, Loader, AlertCircle, MessageSquare, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/common/DashboardLayout';

export default function CustomerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await customerService.getMyBookings();
      // Backend returns a list of AppointmentResponse objects
      // mapping directly to what the component expects!
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await customerService.cancelAppointment(bookingId);
        toast.success('Appointment cancelled successfully');
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel appointment');
      }
    }
  };

  const getBookingStatus = (status) => {
    const statusColors = {
      CONFIRMED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#1A1717]">My Bookings</h1>
            <p className="mt-2 text-sm text-[#7D746F]">
              View and manage all your service bookings
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-[#A31A11]" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#DED6D2] bg-[#FDFDFD] p-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-[#1A1717]">No bookings yet</h3>
              <p className="mt-2 text-sm text-[#7D746F]">
                You haven't made any service bookings yet. Visit our services page to book an appointment!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-[#1A1717]">{booking.serviceName}</h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getBookingStatus(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-[#7D746F]">
                          <Calendar size={16} />
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7D746F]">
                          <Clock size={16} />
                          {booking.time}
                        </div>
                        {booking.staffName && (
                          <div className="flex items-center gap-2 text-sm text-[#7D746F]">
                            <User size={16} />
                            {booking.staffName}
                          </div>
                        )}
                      </div>
                    </div>
                    {booking.status === 'COMPLETED' && (
                      <button
                        onClick={() => navigate(`/customer_dashboard/write-review?serviceId=${booking.serviceId}&serviceName=${encodeURIComponent(booking.serviceName)}`)}
                        className="flex items-center gap-2 rounded-full bg-[#8E1616] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#741212] whitespace-nowrap"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Write Review
                      </button>
                    )}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <div className="md:ml-4 mt-4 md:mt-0">
                        {booking.cancellable ? (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition whitespace-nowrap"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel Booking
                          </button>
                        ) : (
                          <p className="text-sm text-red-700 font-medium">
                            This booking can no longer be cancelled.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">About Bookings</h4>
              <p className="text-sm text-blue-800 mt-1">
                Bookings made through the "Book Appointment" section will appear here. You can view details and manage your appointments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
