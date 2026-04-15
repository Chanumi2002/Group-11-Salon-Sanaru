import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { shopService } from '@/services/shopApi';
import { customerService, closedDateService } from '@/services/api';

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
];

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closedDates, setClosedDates] = useState([]);
  const [dateMessage, setDateMessage] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const serviceId = searchParams.get('serviceId');

  useEffect(() => {
    let isActive = true;

    const loadClosedDates = async () => {
      try {
        const response = await closedDateService.getActiveClosedDates();
        if (isActive) {
          setClosedDates(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load closed dates:', error);
      }
    };

    const loadSelectedService = async () => {
      if (!serviceId) {
        setSelectedService(null);
        setErrorMessage('');
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');

        const data = await shopService.getServiceById(serviceId);
        if (!isActive) return;

        if (!data || data.active === false) {
          setSelectedService(null);
          setErrorMessage('Selected service is not available right now.');
          return;
        }

        setSelectedService(data);
      } catch (error) {
        if (!isActive) return;
        console.error('Failed to load selected service:', error);
        setSelectedService(null);
        setErrorMessage('Unable to load selected service details.');
        toast.error('Unable to load selected service details.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadClosedDates();
    loadSelectedService();
    return () => { isActive = false; };
  }, [serviceId]);

  const fetchBookedSlots = async (selectedDate) => {
    try {
      setSlotsLoading(true);
      // Fetch all bookings for the current user
      const response = await customerService.getMyBookings();
      const allBookings = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
      
      // Filter bookings for the selected date
      const dateBookings = allBookings.filter(apt => apt.appointmentDate === selectedDate);
      
      // Extract booked times
      const booked = dateBookings.map(apt => apt.appointmentTime.substring(0, 5)); // Get HH:MM format
      setBookedSlots(booked);
      
      // Calculate availability
      const totalSlots = TIME_SLOTS.length;
      const bookedCount = booked.length;
      const availableCount = totalSlots - bookedCount;
      
      if (bookedCount === 0) {
        setAvailabilityInfo(`All ${totalSlots} time slots available`);
      } else if (availableCount === 0) {
        setAvailabilityInfo('No time slots available for this date');
      } else {
        setAvailabilityInfo(`${availableCount} of ${totalSlots} slots available`);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      setBookedSlots([]);
      setAvailabilityInfo('');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setTime(''); // Reset time when date changes
    
    // Check if date is marked as closed
    const isClosed = closedDates.some(cd => cd.closedDate === selectedDate);
    if (isClosed) {
      const closedDateInfo = closedDates.find(cd => cd.closedDate === selectedDate);
      setDateMessage(`⚠️ Salon is closed on this date${closedDateInfo?.reason ? ` (${closedDateInfo.reason})` : ''}`);
      setBookedSlots([]);
      setAvailabilityInfo('');
    } else {
      setDateMessage('');
      fetchBookedSlots(selectedDate);
    }
  };

  const handleBook = async () => {
    if (!date || !time || !selectedService) {
      toast.error('Please select both a date and a time slot.');
      return;
    }

    // Check if selected date is closed
    const isClosed = closedDates.some(cd => cd.closedDate === date);
    if (isClosed) {
      toast.error('The selected date is not available. Please choose another date.');
      return;
    }

    try {
      setIsBooking(true);
      await customerService.bookAppointment({
        serviceId: selectedService.id,
        date,
        time: time + ":00" // Format for backend parsing HH:mm:ss
      });
      toast.success('Appointment booked successfully!');
      navigate('/customer_dashboard/bookings');
    } catch (error) {
      console.error(error);
      let msg = 'Time slot unavailable.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        msg = error.response.data;
      }
      toast.error(msg);
    } finally {
      setIsBooking(false);
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD reliably

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="mt-1 text-sm text-gray-600">
            Choose your preferred date and time to schedule your appointment.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {isLoading ? (
            <p className="text-sm text-gray-600">Loading selected service...</p>
          ) : errorMessage ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-700">{errorMessage}</p>
              <Link
                to="/customer_dashboard/services"
                className="inline-flex items-center rounded-md bg-[#8E1616] px-4 py-2 text-sm font-medium text-white hover:bg-[#741212]"
              >
                Browse Services
              </Link>
            </div>
          ) : selectedService ? (
            <div className="space-y-6">
              {/* Service Details */}
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{selectedService.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedService.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-gray-800">
                  <span>Price: Rs. {Number(selectedService.price || 0).toFixed(2)}</span>
                  <span>Duration: {selectedService.durationMinutes || 30} min</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <label htmlFor="appointment-date" className="block text-sm font-semibold text-gray-900">
                  Select Date
                </label>
                <input
                  type="date"
                  id="appointment-date"
                  min={todayDateStr}
                  value={date}
                  onChange={handleDateChange}
                  className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-[#8E1616] focus:ring-[#8E1616] sm:text-sm p-2 border"
                />
                {dateMessage && (
                  <p className="text-sm text-amber-600 font-medium">{dateMessage}</p>
                )}
              </div>

              {/* Time Slots Grid */}
              {date && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-900">
                      Select Time
                    </label>
                    {slotsLoading ? (
                      <span className="text-xs text-gray-500">Loading availability...</span>
                    ) : availabilityInfo && (
                      <span className="text-xs font-medium text-green-600">{availabilityInfo}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = time === slot;
                      
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => !isBooked && setTime(slot)}
                          title={isBooked ? '❌ Already booked' : 'Available'}
                          className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors relative group ${
                            isSelected
                              ? 'bg-[#8E1616] text-white border-[#8E1616]'
                              : isBooked
                              ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#8E1616] hover:text-[#8E1616] hover:bg-red-50'
                          }`}
                        >
                          {slot}
                          {isBooked && (
                            <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Booked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="inline-block w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1"></span>
                    Booked slots are greyed out
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <Link
                  to="/customer_dashboard/services"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  disabled={!date || !time || isBooking}
                  onClick={handleBook}
                  className="inline-flex items-center rounded-md bg-[#8E1616] px-5 py-2 text-sm font-medium text-white hover:bg-[#741212] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">No service selected yet.</p>
              <Link
                to="/customer_dashboard/services"
                className="inline-flex items-center rounded-md bg-[#8E1616] px-4 py-2 text-sm font-medium text-white hover:bg-[#741212]"
              >
                Choose a Service
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
