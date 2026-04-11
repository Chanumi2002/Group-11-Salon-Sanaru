import React, { useEffect, useState } from 'react';
import { Star, Loader, AlertCircle } from 'lucide-react';
import { shopService } from '@/services/shopApi';
import { motion } from 'framer-motion';

export default function AllReviewsDisplay({ feedbackType = 'PRODUCT', title = 'All Customer Reviews' }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllReviews();
  }, [feedbackType]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reviews for the type (PRODUCT or SERVICE)
      let reviews = [];
      if (feedbackType === 'PRODUCT') {
        reviews = await Promise.race([
          shopService.getAllProductReviews(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      } else if (feedbackType === 'SERVICE') {
        reviews = await Promise.race([
          shopService.getAllServiceReviews(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
      }
      
      // Sort by newest first (show all reviews including unread/pending)
      const sorted = Array.isArray(reviews) 
        ? reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      
      setReviews(sorted);
    } catch (err) {
      console.error('Error fetching all reviews:', err);
      // Silently fail - reviews will just be empty
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-[#7D746F]">
        <Loader className="animate-spin mr-2" size={20} />
        Loading reviews...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-red-200 bg-red-50 p-4 flex items-center gap-3">
        <AlertCircle size={20} className="text-red-600" />
        <div>
          <p className="font-medium text-red-900">{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-[#7D746F]">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[16px] border border-[#DED6D2] bg-[#FDFDFD] p-6 shadow-[0_12px_24px_-20px_rgba(73,61,61,0.28)]">
        <h2 className="text-2xl font-semibold text-[#1A1717]">{title}</h2>
        <p className="text-sm text-[#7D746F] mt-1">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} from our customers
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
            className="rounded-[16px] border border-[#E4D8D2] bg-[#FDFDFD] p-5 shadow-[0_4px_12px_-4px_rgba(75,58,58,0.15)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#1A1717]">{review.userName || 'Anonymous'}</p>
                  {review.isRead === false && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                  )}
                </div>
                <p className="text-xs text-[#7D746F]">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {renderStars(review.rating)}
            </div>

            {review.targetName && (
              <p className="text-sm text-[#A31A11] font-medium mb-2">
                About: {review.targetName}
              </p>
            )}

            <p className="text-[#6E6662] leading-relaxed">{review.comment}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
