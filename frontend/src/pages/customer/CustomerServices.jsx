import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { shopService } from '@/services/shopApi';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

const DEFAULT_DURATION_MINUTES = 30;

const normalizeService = (service, index) => {
  const priceValue = Number(service?.price);
  const durationValue = Number(service?.durationMinutes);

  return {
    id: service?.id ?? `service-${index}`,
    name: typeof service?.name === 'string' && service.name.trim() ? service.name.trim() : 'Unnamed service',
    description:
      typeof service?.description === 'string' && service.description.trim()
        ? service.description.trim()
        : 'No description available.',
    price: Number.isFinite(priceValue) ? priceValue : 0,
    durationMinutes: Number.isInteger(durationValue) && durationValue > 0
      ? durationValue
      : DEFAULT_DURATION_MINUTES,
    imageSource: service?.imageUrl || service?.image || service?.imagePath || '',
  };
};

export default function CustomerServices() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [serviceStats, setServiceStats] = useState({});

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const data = await shopService.getServices();
      const safeList = Array.isArray(data) ? data : [];
      const normalized = safeList
        .filter((service) => service && service.active !== false)
        .map(normalizeService);

      setServices(normalized);

      // Fetch stats for each service
      const stats = {};
      for (const service of normalized) {
        try {
          const serviceStats = await shopService.getReviewStats(service.id, 'SERVICE');
          stats[service.id] = serviceStats;
        } catch (err) {
          // Stats might not exist yet, that's fine
          stats[service.id] = null;
        }
      }
      setServiceStats(stats);
    } catch (error) {
      console.error('Failed to fetch customer services:', error);
      const message = 'Unable to load salon services right now. Please try again.';
      setErrorMessage(message);
      toast.error(message);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salon Services</h1>
          <p className="mt-1 text-sm text-gray-600">
            Compare service options by price and estimated duration before booking.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            Loading available services...
          </div>
        ) : errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
            <button
              type="button"
              onClick={fetchServices}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-base font-medium text-gray-800">No active services available right now.</p>
            <p className="mt-1 text-sm text-gray-600">Please check again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-52 overflow-hidden bg-gray-100">
                  {service.imageSource ? (
                    <img
                      src={resolveImageUrl(service.imageSource)}
                      alt={service.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                      No image available
                    </div>
                  )}
                </div>

                <div className="space-y-2 p-4">
                  <h2 className="text-lg font-semibold text-gray-900">{service.name}</h2>
                  <p className="line-clamp-2 text-sm text-gray-600">{service.description}</p>
                  
                  {serviceStats[service.id]?.averageRating ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.round(serviceStats[service.id].averageRating) ? 'fill-[#FFA500] text-[#FFA500]' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {serviceStats[service.id].averageRating.toFixed(1)} ({serviceStats[service.id].count} review{serviceStats[service.id].count !== 1 ? 's' : ''})
                      </span>
                    </div>
                  ) : null}
                  
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="text-lg font-bold text-[#8E1616]">
                      Rs. {service.price.toFixed(2)}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {service.durationMinutes} min
                    </p>
                  </div>
                  <Link
                    to={`/customer_dashboard/book?serviceId=${encodeURIComponent(service.id)}`}
                    className="inline-flex w-full items-center justify-center rounded-md bg-[#8E1616] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#741212]"
                  >
                    Book Now
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
