import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ChevronLeft, MapPin, Clock, Heart } from 'lucide-react';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import { shopService } from '@/services/shopApi';
import { resolveImageUrl } from '@/utils/resolveImageUrl';
import { getStoredToken, getStoredRole } from '@/utils/authState';

export default function GuestServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceStats, setServiceStats] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        const data = await shopService.getServiceById(id);
        setService(data || null);

        // Fetch stats
        try {
          const stats = await shopService.getReviewStats(id, 'SERVICE');
          setServiceStats(stats);
        } catch (err) {
          setServiceStats(null);
        }
      } catch (error) {
        console.error('Failed to load service details:', error);
        toast.error('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/services');
  };

  const handleBookNow = () => {
    const token = getStoredToken();
    const role = getStoredRole();
    const query = id ? `?serviceId=${encodeURIComponent(id)}` : '';
    const bookingPath = '/customer_dashboard/book';

    if (!token || role !== 'CUSTOMER') {
      navigate('/login', { state: { from: { pathname: bookingPath, search: query } } });
      return;
    }

    navigate(`${bookingPath}${query}`);
  };

  const handleToggleFavorite = () => {
    if (!getStoredToken()) {
      toast.info('Please login to add services to favorites.');
      navigate('/login');
      return;
    }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EBEBEB] flex flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
          <div className="rounded-[16px] border border-[#E2D4CD] bg-[#FDFDFD] p-10 text-center text-[#7D746F]">
            Loading service details...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#EBEBEB] flex flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
          <div className="rounded-[16px] border border-dashed border-[#E2D4CD] bg-[#FDFDFD] p-10 text-center">
            <h3 className="text-lg font-medium text-[#1A1717]">Service not found</h3>
            <p className="mt-2 text-sm text-[#7D746F]">The service you're looking for doesn't exist.</p>
            <button
              onClick={handleBack}
              className="mt-4 inline-flex items-center justify-center rounded-[10px] bg-[#8E1616] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#741212]"
            >
              Back to Services
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageSource = service.imageUrl || service.image || service.imagePath;

  return (
    <div className="min-h-screen bg-[#EBEBEB] flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-[1380px] flex-1 px-4 py-8 md:px-6 lg:px-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-[#7D746F] hover:text-[#1A1717] transition"
        >
          <ChevronLeft size={20} />
          <span>Back to Services</span>
        </motion.button>

        {/* Service header and details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8"
        >
          {/* Image */}
          <div className="md:col-span-2">
            <div className="rounded-[16px] overflow-hidden border border-[#E4D8D2] h-[400px] bg-[#F2ECE8]">
              {imageSource ? (
                <img
                  src={resolveImageUrl(imageSource)}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-[#7B706B]">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] p-5 shadow-[0_4px_12px_-4px_rgba(75,58,58,0.15)]"
            >
              <p className="text-sm text-[#7D746F] mb-3">Price</p>
              <p className="text-3xl font-bold text-[#A31A11]">
                Rs. {Number(service.price || 0).toFixed(2)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] p-5 shadow-[0_4px_12px_-4px_rgba(75,58,58,0.15)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock size={18} className="text-[#A31A11]" />
                <p className="text-sm font-medium text-[#1A1717]">Duration</p>
              </div>
              <p className="text-lg font-semibold text-[#7D746F]">
                {service.durationMinutes || 30} minutes
              </p>
            </motion.div>

            {serviceStats?.averageRating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] p-5 shadow-[0_4px_12px_-4px_rgba(75,58,58,0.15)]"
              >
                <p className="text-sm text-[#7D746F] mb-2">Rating</p>
                <p className="text-lg font-bold text-[#A31A11]">
                  {serviceStats.averageRating.toFixed(1)} / 5
                </p>
                <p className="text-xs text-[#7D746F] mt-1">
                  ({serviceStats.count} review{serviceStats.count !== 1 ? 's' : ''})
                </p>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleBookNow}
                className="flex-1 rounded-[10px] bg-[#8E1616] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741212]"
              >
                Book Now
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center rounded-[10px] px-4 py-3 transition ${
                  isFavorite
                    ? 'bg-[#A31A11] text-white'
                    : 'border border-[#E4D8D2] bg-[#FDFDFD] text-[#A31A11] hover:bg-[#F0EDE9]'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="mb-8 rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] p-6 shadow-[0_4px_12px_-4px_rgba(75,58,58,0.15)]"
        >
          <h2 className="mb-4 text-2xl font-semibold text-[#1A1717]">{service.name}</h2>
          <p className="text-[#6E6662] leading-relaxed">{service.description}</p>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        >
          <ReviewsDisplay
            targetId={service.id}
            feedbackType="SERVICE"
            title="Customer Reviews for This Service"
          />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
