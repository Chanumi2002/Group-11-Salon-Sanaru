import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { shopService } from '@/services/shopApi';
import { resolveImageUrl } from '@/utils/resolveImageUrl';

export default function Services() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStats, setServiceStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await shopService.getServices();
        const normalizedServices = Array.isArray(data)
          ? data.filter((service) => service?.active !== false)
          : [];
        setServices(normalizedServices);

        // Fetch stats for each service
        const stats = {};
        for (const service of normalizedServices) {
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
        console.error('Failed to fetch services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleBookNow = (serviceId) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const query = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : '';
    const bookingPath = '/customer_dashboard/book';

    if (!token || role !== 'CUSTOMER') {
      navigate('/login', { state: { from: { pathname: bookingPath, search: query } } });
      return;
    }

    navigate(`${bookingPath}${query}`);
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-6 rounded-[16px] border border-[#DED6D2] bg-[#FDFDFD] p-5 shadow-[0_12px_24px_-20px_rgba(73,61,61,0.28)]"
        >
          <h1 className="text-2xl md:text-3xl font-medium text-[#1A1717]">Salon Services</h1>
          <p className="text-sm text-[#7D746F] mt-1">Browse our latest services and current pricing.</p>
        </motion.div>

        {isLoading ? (
          <div className="rounded-[16px] border border-[#E2D4CD] bg-[#FDFDFD] p-10 text-center text-[#7D746F]">
            Loading services...
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#E2D4CD] bg-[#FDFDFD] p-10 text-center">
            <h3 className="text-lg font-medium text-[#1A1717]">No services available</h3>
            <p className="mt-2 text-sm text-[#7D746F]">Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const imageSource = service.imageUrl || service.image || service.imagePath;

              return (
                <motion.article
                  key={service.id}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.35), ease: 'easeOut' }}
                  className="overflow-hidden rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] shadow-[0_10px_22px_-18px_rgba(75,58,58,0.35)]"
                >
                  <div className="h-[220px] overflow-hidden bg-[#F2ECE8]">
                    {imageSource ? (
                      <img
                        src={resolveImageUrl(imageSource)}
                        alt={service.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-[#7B706B]">
                        No image available
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-4">
                    <h2 className="text-[1.05rem] font-medium text-[#1A1717]">{service.name}</h2>
                    <p className="text-sm text-[#6E6662] line-clamp-2">{service.description}</p>
                    
                    {serviceStats[service.id]?.averageRating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < Math.round(serviceStats[service.id].averageRating) ? 'fill-[#FFA500] text-[#FFA500]' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#7D746F]">
                          {serviceStats[service.id].averageRating.toFixed(1)} ({serviceStats[service.id].count} review{serviceStats[service.id].count !== 1 ? 's' : ''})
                        </span>
                      </div>
                    ) : null}
                    
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[1.1rem] font-semibold text-[#A31A11]">
                        Rs. {Number(service.price || 0).toFixed(2)}
                      </p>
                      <p className="text-sm font-medium text-[#5E5753]">
                        {service.durationMinutes || 30} min
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBookNow(service.id)}
                      className="mt-1 inline-flex w-full items-center justify-center rounded-[10px] bg-[#8E1616] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#741212]"
                    >
                      Book Now
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
