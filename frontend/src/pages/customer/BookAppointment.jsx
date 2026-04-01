import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { shopService } from '@/services/shopApi';

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        if (!isActive) {
          return;
        }

        if (!data || data.active === false) {
          setSelectedService(null);
          setErrorMessage('Selected service is not available right now.');
          return;
        }

        setSelectedService(data);
      } catch (error) {
        if (!isActive) {
          return;
        }
        console.error('Failed to load selected service:', error);
        const message = 'Unable to load selected service details.';
        setSelectedService(null);
        setErrorMessage(message);
        toast.error(message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSelectedService();

    return () => {
      isActive = false;
    };
  }, [serviceId]);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="mt-1 text-sm text-gray-600">
            Choose your service and continue to booking when appointment scheduling is enabled.
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
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">{selectedService.name}</h2>
              <p className="text-sm text-gray-600">{selectedService.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-800">
                <span>Price: Rs. {Number(selectedService.price || 0).toFixed(2)}</span>
                <span>Duration: {selectedService.durationMinutes || 30} min</span>
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
