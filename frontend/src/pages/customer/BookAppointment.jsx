import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { shopService } from '@/services/shopApi';
import { customerService } from '@/services/api';

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

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const serviceId = searchParams.get('serviceId');

  useEffect(() => {
    let isActive = true;

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

    loadSelectedService();
    return () => { isActive = false; };
  }, [serviceId]);

  const handleBook = async () => {
    if (!date || !time || !selectedService) {
      toast.error('Please select both a date and a time slot.');
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
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime(''); // Reset time when date changes
                  }}
                  className="block w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-[#8E1616] focus:ring-[#8E1616] sm:text-sm p-2 border"
                />
              </div>

              {/* Time Slots Grid */}
              {date && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Select Time
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
                          time === slot
                            ? 'bg-[#8E1616] text-white border-[#8E1616]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#8E1616] hover:text-[#8E1616]'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
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
