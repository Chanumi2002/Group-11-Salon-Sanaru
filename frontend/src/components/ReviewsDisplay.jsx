import React, { useEffect, useState } from 'react';
import { Star, Loader, AlertCircle } from 'lucide-react';
import { shopService } from '@/services/shopApi';

export default function ReviewsDisplay({ targetId, feedbackType = 'PRODUCT', title = 'Customer Reviews' }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [targetId, feedbackType]);

  const fetchReviews = async () => {
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch reviews
      const reviewsResponse = await shopService.getReviewsForTarget(targetId, feedbackType);
      setReviews(Array.isArray(reviewsResponse) ? reviewsResponse : []);

      // Fetch stats
      const statsResponse = await shopService.getReviewStats(targetId, feedbackType);
      setStats(statsResponse);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
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
      <div className="flex justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-[#A31A11]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-red-900">Error Loading Reviews</h4>
          <p className="text-sm text-red-800 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-[#DED6D2]">
      {/* Header with Rating Summary */}
      <div>
        <h3 className="text-2xl font-bold text-[#1A1717] mb-4">{title}</h3>

        {stats && (
          <div className="rounded-lg border border-[#DED6D2] bg-[#F9F5F1] p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#A31A11]">
                    {typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0'}
                  </div>
                  <div className="flex gap-1 justify-center mt-2">
                    {renderStars(Math.round(stats.averageRating || 0))}
                  </div>
                  <p className="text-sm text-[#7D746F] mt-2">
                    Based on {stats.totalFeedbacks || 0} review{(stats.totalFeedbacks || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {stats.ratingDistribution && (
                <div className="flex-1 space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingDistribution[rating] || 0;
                    const percentage = stats.totalFeedbacks ? Math.round((count / stats.totalFeedbacks) * 100) : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[#7D746F] min-w-[30px]">{rating}</span>
                        <div className="flex gap-1">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <div className="flex-1 h-2 bg-[#E2D4CD] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#A31A11] transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#7D746F] min-w-[40px] text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#DED6D2] bg-[#FDFDFD] p-12 text-center">
          <Star size={48} className="mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-[#1A1717]">No reviews yet</h4>
          <p className="text-sm text-[#7D746F] mt-2">
            Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1A1717]">
                      {review.userName || 'Anonymous Customer'}
                    </p>
                    <p className="text-sm text-[#7D746F]">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-[#4C4542] leading-relaxed">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
