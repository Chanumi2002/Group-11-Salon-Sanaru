import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { shopService } from '@/services/shopApi';
import { customerService, closedDateService, adminService } from '@/services/api';
import axios from 'axios';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [closedDates, setClosedDates] = useState([]);
  const [dateMessage, setDateMessage] = useState('');
  const [slotAvailability, setSlotAvailability] = useState({}); // Map of time -> {available, capacity, booked}
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availabilityInfo, setAvailabilityInfo] = useState('');
  const [timeSlots, setTimeSlots] = useState([]); // Dynamically fetched time slots
  const [breaks, setBreaks] = useState([]); // Breaks for the selected day
  const [showAvailable, setShowAvailable] = useState(true); // Legend filter: show available slots
  const [showBooked, setShowBooked] = useState(true); // Legend filter: show booked slots
  const [holidays, setHolidays] = useState([]); // List of holidays
  const [isHolidaysLoading, setIsHolidaysLoading] = useState(false);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const serviceId = searchParams.get('serviceId');

  // Load holidays on component mount
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        setIsHolidaysLoading(true);
        const response = await axios.get('http://localhost:8080/api/holidays');
        console.log('Holidays loaded:', response.data);
        setHolidays(response.data || []);
      } catch (error) {
        console.error('Failed to load holidays:', error);
        setHolidays([]);
      } finally {
        setIsHolidaysLoading(false);
      }
    };
    loadHolidays();
  }, []);

  // Log holidays whenever they update
  useEffect(() => {
    if (holidays.length > 0) {
      console.log(`✅ Holidays loaded: ${holidays.length} total`);
      console.log('First 3 holidays:', holidays.slice(0, 3));
    } else {
      console.log('ℹ️ Waiting for holidays to load...');
    }
  }, [holidays]);

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
      // Fetch slot availability info (booked count, capacity, available spots)
      const response = await customerService.getSlotAvailability(selectedDate);
      const availabilityData = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
      
      console.log(`Availability data for ${selectedDate}:`, availabilityData); // Debug log
      
      // Create a map of time -> availability info
      const availabilityMap = {};
      let totalAvailable = 0;
      let totalCapacity = 0;
      
      availabilityData.forEach(slot => {
        availabilityMap[slot.time] = {
          available: slot.available,
          capacity: slot.capacity,
          booked: slot.booked,
          isFull: slot.isFull
        };
        totalAvailable += slot.available;
        totalCapacity += slot.capacity;
      });
      
      console.log(`Total capacity: ${totalCapacity}, Total available: ${totalAvailable}, Total booked: ${totalCapacity - totalAvailable}`); // Debug log
      
      setSlotAvailability(availabilityMap);
      
      // Calculate availability summary
      const totalBooked = totalCapacity - totalAvailable;
      if (totalBooked === 0) {
        setAvailabilityInfo(`All ${totalCapacity} spots available`);
      } else if (totalAvailable === 0) {
        setAvailabilityInfo('No spots available for this date');
      } else {
        setAvailabilityInfo(`${totalAvailable} of ${totalCapacity} spots available`);
      }
    } catch (error) {
      console.error('Error fetching slot availability:', error);
      console.error('Response:', error?.response?.data);
      setSlotAvailability({});
      setAvailabilityInfo('');
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchTimeSlots = async (selectedDate) => {
    try {
      // Get day of week from date - use UTC to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed
      const jsDay = dateObj.getUTCDay(); // 0 = Sunday, 1 = Monday, etc. (in UTC)
      
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayOfWeek = dayNames[jsDay];
      
      console.log(`📅 Selected date: ${selectedDate}, Day of week: ${dayOfWeek}`);

      // Fetch available slots - these should include full slot objects with breaks
      const response = await adminService.getAvailableSlots(dayOfWeek);
      const slots = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
      
      console.log(`Found ${slots.length} slots for ${dayOfWeek}:`, slots);
      
      // Extract breaks and time strings
      let breaksData = [];
      let timeStrings = [];
      
      slots.forEach(slot => {
        // Handle string responses (just times)
        if (typeof slot === 'string') {
          timeStrings.push(slot);
          return;
        }
        
        // Handle object responses (full slot objects with breaks)
        if (typeof slot === 'object') {
          // Extract time
          const timeStr = slot.time || slot.startTime;
          if (timeStr) {
            // Ensure it's in HH:MM format
            if (timeStr.length > 5) {
              timeStrings.push(timeStr.substring(0, 5));
            } else {
              timeStrings.push(timeStr);
            }
          }
          
          // Extract breaks if available
          if (slot.breaks && Array.isArray(slot.breaks)) {
            console.log(`Slot ${timeStr} has ${slot.breaks.length} breaks:`, slot.breaks);
            breaksData = breaksData.concat(slot.breaks);
          }
        }
      });
      
      // Deduplicate breaks by name
      const uniqueBreaks = Array.from(
        new Map(breaksData.map(brk => [brk.breakName, brk])).values()
      );
      
      setBreaks(uniqueBreaks);
      console.log(`✅ Found ${uniqueBreaks.length} unique breaks for ${dayOfWeek}:`);
      uniqueBreaks.forEach(brk => {
        console.log(`  ⏸️ ${brk.breakName}: ${brk.startTime} to ${brk.endTime}`);
      });
      
      // Deduplicate times using Set and sort
      const uniqueTimeStrings = Array.from(new Set(timeStrings)).sort();
      console.log(`📊 Total unique times: ${uniqueTimeStrings.length}`);
      
      // Filter out times that conflict with breaks
      const filteredTimes = uniqueTimeStrings.filter(time => !timeConflictsWithBreak(time, uniqueBreaks));
      const filtered = uniqueTimeStrings.length - filteredTimes.length;
      console.log(`🚫 Filtered out ${filtered} times due to breaks`);
      
      if (filtered > 0) {
        console.log('Filtered times:', uniqueTimeStrings.filter(time => timeConflictsWithBreak(time, uniqueBreaks)));
      }
      
      setTimeSlots(filteredTimes);
    } catch (error) {
      console.error('❌ Error fetching time slots:', error);
      setTimeSlots([]);
      setBreaks([]);
    }
  };

  // Check if a date is a holiday
  const isDateHoliday = (selectedDate) => {
    console.log(`Checking ${selectedDate} against ${holidays.length} holidays`);
    if (holidays.length === 0) {
      console.warn('No holidays loaded yet!');
      return false;
    }
    return holidays.some(holiday => {
      // Note: The API returns "start" and "end" fields (from @JsonProperty in backend)
      const startDate = holiday.start || holiday.startDate;
      const endDate = holiday.end || holiday.endDate;
      console.log(`Holiday: ${holiday.summary}, start: ${startDate}, end: ${endDate}`);
      const isMatch = selectedDate >= startDate && selectedDate <= endDate;
      if (isMatch) {
        console.log(`MATCH FOUND: ${selectedDate} matches holiday ${holiday.summary} (${startDate} - ${endDate})`);
      }
      return isMatch;
    });
  };

  // Get holiday info for a date
  const getHolidayInfo = (selectedDate) => {
    console.log(`Getting holiday info for ${selectedDate}, available holidays: ${holidays.length}`);
    if (holidays.length === 0) {
      console.warn('No holidays loaded yet!');
      return null;
    }
    const found = holidays.find(holiday => {
      // Note: The API returns "start" and "end" fields (from @JsonProperty in backend)
      const startDate = holiday.start || holiday.startDate;
      const endDate = holiday.end || holiday.endDate;
      console.log(`Comparing ${selectedDate} with ${holiday.summary}: ${startDate} to ${endDate}`);
      const isMatch = selectedDate >= startDate && selectedDate <= endDate;
      if (isMatch) {
        console.log(`FOUND: ${selectedDate} is ${holiday.summary} (${startDate} to ${endDate})`);
      }
      return isMatch;
    });
    console.log('Holiday info result:', found);
    return found;
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setTime(''); // Reset time when date changes
    
    console.log(`Selected date: ${selectedDate}, Available holidays: ${holidays.length}`);
    
    // Check if date is a holiday
    const holidayInfo = getHolidayInfo(selectedDate);
    console.log(`Holiday check for ${selectedDate}:`, holidayInfo);
    
    if (holidayInfo) {
      setDateMessage(`🏖️ ${holidayInfo.summary} - Salon is closed on this date`);
      setSlotAvailability({});
      setAvailabilityInfo('');
      setTimeSlots([]);
      return;
    }
    
    // Check if date is marked as closed
    const isClosed = closedDates.some(cd => cd.closedDate === selectedDate);
    if (isClosed) {
      const closedDateInfo = closedDates.find(cd => cd.closedDate === selectedDate);
      setDateMessage(`⚠️ Salon is closed on this date${closedDateInfo?.reason ? ` (${closedDateInfo.reason})` : ''}`);
      setSlotAvailability({});
      setAvailabilityInfo('');
      setTimeSlots([]);
    } else {
      setDateMessage('');
      setBreaks([]); // Reset breaks
      // First fetch the time slots for this day of week, then fetch availability
      fetchTimeSlots(selectedDate);
      fetchBookedSlots(selectedDate);
    }
  };

  // Helper function to check if a time conflicts with any break
  const timeConflictsWithBreak = (timeString, breaksData) => {
    if (!breaksData || breaksData.length === 0) return false;
    
    // Parse the time string "HH:MM"
    const [hours, minutes] = timeString.split(':').map(Number);
    const appointmentTime = hours * 60 + minutes; // Convert to minutes since midnight
    
    // Check if this time falls within any break period
    return breaksData.some(brk => {
      // Parse break times - handle both "HH:MM" and "HH:MM:SS" formats
      let breakStartStr = brk.startTime || '';
      let breakEndStr = brk.endTime || '';
      
      // Extract HH:MM if format is HH:MM:SS
      if (breakStartStr.length > 5) breakStartStr = breakStartStr.substring(0, 5);
      if (breakEndStr.length > 5) breakEndStr = breakEndStr.substring(0, 5);
      
      const [breakStartHour, breakStartMin] = breakStartStr.split(':').map(Number);
      const [breakEndHour, breakEndMin] = breakEndStr.split(':').map(Number);
      
      if (isNaN(breakStartHour) || isNaN(breakEndHour)) return false;
      
      const breakStart = breakStartHour * 60 + breakStartMin;
      const breakEnd = breakEndHour * 60 + breakEndMin;
      
      // Appointment time conflicts if: appointmentTime >= breakStart AND appointmentTime < breakEnd
      // * Break 12:20-13:00: Appointment at 13:00 is ALLOWED (appointment at break end time is OK)
      // * Break 12:30-13:15: Appointment at 13:00 is BLOCKED (still within break period)
      // * Break 12:30-13:15: Appointment at 13:30 is ALLOWED (after break ends)
      const conflicts = appointmentTime >= breakStart && appointmentTime < breakEnd;
      
      if (conflicts) {
        console.log(`⚠️ Time ${timeString} conflicts with break "${brk.breakName}" (${brk.startTime}-${brk.endTime})`);
      }
      
      return conflicts;
    });
  };

  // Helper function to filter time slots based on legend toggle selections
  const getFilteredSlots = (slotsToFilter) => {
    return slotsToFilter.filter(slot => {
      const availability = slotAvailability[slot];
      const isBooked = availability?.isFull;
      
      // Show slot if: (it's available and showAvailable is true) OR (it's booked and showBooked is true)
      if (isBooked) return showBooked;
      return showAvailable;
    });
  };

  const handleBook = async () => {
    if (!date || !time || !selectedService) {
      toast.error('Please select both a date and a time slot.');
      return;
    }

    // Check if selected date is a holiday
    const holidayInfo = getHolidayInfo(date);
    if (holidayInfo) {
      toast.error(`Cannot book on ${holidayInfo.summary}. Salon is closed.`);
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
      console.error('Booking error details:', error);
      console.error('Full response data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Response status:', error.response?.status);
      console.error('Request data sent:', { serviceId: selectedService.id, date, time: time + ":00" });
      
      let msg = 'Unable to book appointment. Please try again.';
      
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        msg = error.response.data;
      } else if (error.response?.data?.error) {
        msg = error.response.data.error;
      } else if (error.message) {
        msg = error.message;
      }
      
      toast.error(msg);
    } finally {
      setIsBooking(false);
    }
  };

  const todayDateStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD reliably

  // Helper component for time slot button
  const TimeSlotButton = ({ slot, availability, isSelected, onSelect }) => {
    const isBooked = availability?.isFull;
    const available = availability?.available || 0;
    const capacity = availability?.capacity || 0;
    
    return (
      <button
        type="button"
        disabled={isBooked}
        onClick={() => !isBooked && onSelect(slot)}
        title={isBooked ? '❌ Fully booked' : `${available} spots available`}
        className={`py-3 px-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 relative group ${
          isSelected
            ? 'bg-[#8E1616] text-white border-[#8E1616] shadow-md shadow-red-200'
            : isBooked
            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60'
            : 'bg-white text-gray-700 border-green-400 hover:border-[#8E1616] hover:text-[#8E1616] hover:bg-red-50 hover:shadow-md'
        }`}
      >
        <div className="flex flex-col items-center">
          <span>{slot}</span>
          <span className={`text-xs mt-1 font-medium ${
            isSelected ? 'text-white' 
            : isBooked ? 'text-gray-500' 
            : 'text-green-600'
          }`}>
            {isSelected 
              ? '✓ Selected' 
              : isBooked 
              ? '✗ Full' 
              : `${available}/${capacity}`
            }
          </span>
        </div>
        {isBooked && (
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Fully booked
          </span>
        )}
      </button>
    );
  };

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
                
                {/* Display breaks for the selected date */}
                {date && breaks.length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs font-semibold text-orange-900 mb-2">⏸️ Breaks on this date:</p>
                    <div className="space-y-1">
                      {breaks.map((brk, idx) => (
                        <p key={idx} className="text-xs text-orange-800">
                          <span className="font-medium">{brk.breakName}</span>: {brk.startTime} - {brk.endTime}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slots Grid */}
              {date && (
                <div className="space-y-4">
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

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-xs p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAvailable}
                        onChange={(e) => setShowAvailable(e.target.checked)}
                        className="w-4 h-4 border-green-400 rounded cursor-pointer"
                      />
                      <span>Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showBooked}
                        onChange={(e) => setShowBooked(e.target.checked)}
                        className="w-4 h-4 border-gray-300 rounded cursor-pointer"
                      />
                      <span>Booked</span>
                    </label>
                  </div>

                  {/* Time Slots Grid with Row Labels */}
                  <div className="space-y-3">
                    {timeSlots.length === 0 ? (
                      <p className="text-center text-gray-500 py-6">No time slots available for this day</p>
                    ) : (
                      <>
                        {/* Morning slots (9:00 - 11:59) */}
                        {getFilteredSlots(timeSlots.filter(t => {
                          const hour = parseInt(t.split(':')[0]);
                          return hour >= 9 && hour < 12;
                        })).length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Morning</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {getFilteredSlots(timeSlots.filter(t => {
                                const hour = parseInt(t.split(':')[0]);
                                return hour >= 9 && hour < 12;
                              })).map((slot) => (
                                <TimeSlotButton key={slot} slot={slot} availability={slotAvailability[slot]} isSelected={time === slot} onSelect={setTime} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Afternoon slots (12:00 - 14:59) */}
                        {getFilteredSlots(timeSlots.filter(t => {
                          const hour = parseInt(t.split(':')[0]);
                          return hour >= 12 && hour < 15;
                        })).length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Afternoon</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {getFilteredSlots(timeSlots.filter(t => {
                                const hour = parseInt(t.split(':')[0]);
                                return hour >= 12 && hour < 15;
                              })).map((slot) => (
                                <TimeSlotButton key={slot} slot={slot} availability={slotAvailability[slot]} isSelected={time === slot} onSelect={setTime} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evening slots (15:00 onwards) */}
                        {getFilteredSlots(timeSlots.filter(t => {
                          const hour = parseInt(t.split(':')[0]);
                          return hour >= 15;
                        })).length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Evening</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                              {getFilteredSlots(timeSlots.filter(t => {
                                const hour = parseInt(t.split(':')[0]);
                                return hour >= 15;
                              })).map((slot) => (
                                <TimeSlotButton key={slot} slot={slot} availability={slotAvailability[slot]} isSelected={time === slot} onSelect={setTime} />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Detailed Availability Info */}
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-900">
                      {Object.values(slotAvailability).length > 0 ? (
                        <>
                          <span className="font-semibold">Total Capacity:</span> {Object.values(slotAvailability).reduce((sum, s) => sum + (s?.capacity || 0), 0)} | 
                          <span className="font-semibold ml-2">Available Spots:</span> {Object.values(slotAvailability).reduce((sum, s) => sum + (s?.available || 0), 0)} | 
                          <span className="font-semibold ml-2">Booked:</span> {Object.values(slotAvailability).reduce((sum, s) => sum + (s?.booked || 0), 0)}
                        </>
                      ) : (
                        <span>Select a date to see availability</span>
                      )}
                    </p>
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
