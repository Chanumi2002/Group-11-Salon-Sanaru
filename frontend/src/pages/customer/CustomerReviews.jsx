import React, { useEffect, useState } from 'react';
import { customerService } from '@/services/api';
import { toast } from 'sonner';
import { Trash2, Star, Loader, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Button } from '@/components/ui/button';
import ReviewForm from '@/components/ReviewForm';

export default function CustomerReviews() {
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await customerService.getMyFeedbacks();
      if (response.data.success) {
        setMyReviews(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error if it's just empty
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await customerService.deleteMyFeedback(reviewId);
      if (response.data.success) {
        toast.success('Review deleted successfully');
        setMyReviews(myReviews.filter((r) => r.id !== reviewId));
      } else {
        toast.error(response.data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setMyReviews([newReview, ...myReviews]);
    setShowForm(false);
    toast.success('Review submitted successfully!');
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

  const getReviewTypeColor = (type) => {
    const colors = {
      PRODUCT: 'bg-blue-100 text-blue-800',
      SERVICE: 'bg-purple-100 text-purple-800',
      EXPERIENCE: 'bg-green-100 text-green-800',
      STAFF: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1717]">My Reviews & Ratings</h1>
              <p className="mt-2 text-sm text-[#7D746F]">
                Share your feedback about our products and services
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#EF1F1F] hover:bg-[#D91A1A] text-white flex items-center gap-2"
            >
              <Plus size={18} />
              Write a Review
            </Button>
          </div>

          {/* Review Form */}
          {showForm && (
            <div className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6">
              <ReviewForm 
                onReviewAdded={handleReviewAdded}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-[#A31A11]" />
            </div>
          ) : myReviews.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#DED6D2] bg-[#FDFDFD] p-12 text-center">
              <Star size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-[#1A1717]">No reviews yet</h3>
              <p className="mt-2 text-sm text-[#7D746F]">
                Share your experience by writing your first review!
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-[#EF1F1F] hover:bg-[#D91A1A] text-white"
              >
                Write Your First Review
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getReviewTypeColor(review.feedbackType)}`}>
                          {review.feedbackType}
                        </span>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-xs text-[#7D746F]">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
