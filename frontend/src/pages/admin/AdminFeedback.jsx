import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Trash2, Star, Loader, AlertCircle, Filter, Check } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/common/AdminDashboardLayout';
import { Button } from '@/components/ui/Button';
import { useFeedback } from '@/context/FeedbackContext';

export default function AdminFeedback() {
  const [searchParams] = useSearchParams();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvingFeedbackId, setApprovingFeedbackId] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [stats, setStats] = useState(null);
  const { decrementUnapprovedCount, fetchUnapprovedCount } = useFeedback();

  const feedbackTypes = [
    { value: 'ALL', label: 'All Reviews' },
    { value: 'PRODUCT', label: 'Product Reviews' },
    { value: 'SERVICE', label: 'Service Reviews' },
    { value: 'EXPERIENCE', label: 'Experience' },
    { value: 'STAFF', label: 'Staff' },
  ];

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [filterType]);

  // Handle scrolling to selected feedback when ID is in query params
  useEffect(() => {
    const feedbackId = searchParams.get('id');
    if (feedbackId) {
      setSelectedFeedbackId(parseInt(feedbackId));
      // Scroll to the feedback after a slight delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(`feedback-${feedbackId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [searchParams, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filterType === 'ALL') {
        response = await adminService.getAllFeedbacks();
      } else {
        response = await adminService.getFeedbacksByType(filterType);
      }

      if (response.data?.success) {
        setFeedbacks(response.data.data || []);
        // Refresh the unapproved count in sidebar
        await fetchUnapprovedCount();
      } else {
        toast.error(response.data?.message || 'Failed to load feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getFeedbackStats();
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminService.deleteFeedback(feedbackId);

      if (response.data?.success) {
        toast.success('Review deleted successfully');
        setFeedbacks(feedbacks.filter((f) => f.id !== feedbackId));
        fetchStats(); // Refresh stats
      } else {
        toast.error(response.data?.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete review';
      if (error.response?.status === 403) {
        toast.error('Only admins can delete reviews');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveFeedback = async (feedbackId) => {
    try {
      setApprovingFeedbackId(feedbackId);
      const response = await adminService.approveFeedback(feedbackId);
      if (response.data?.success) {
        // Update local state
        setFeedbacks(
          feedbacks.map((f) =>
            f.id === feedbackId ? { ...f, isRead: true } : f
          )
        );
        // Decrement the unapproved count in sidebar
        decrementUnapprovedCount();
        // Refresh stats
        await fetchStats();
        toast.success('Feedback approved successfully');
      } else {
        toast.error(response.data?.message || 'Failed to approve feedback');
      }
    } catch (error) {
      console.error('Error approving feedback:', error);
      toast.error('Failed to approve feedback');
    } finally {
      setApprovingFeedbackId(null);
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
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-[#1A1717]">Review Moderation</h1>
            <p className="mt-2 text-sm text-[#7D746F]">
              Manage customer reviews and moderate inappropriate content
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6">
                <p className="text-sm text-[#7D746F]">Total Reviews</p>
                <p className="mt-2 text-2xl font-bold text-[#1A1717]">{stats.totalFeedbacks || 0}</p>
              </div>
              <div className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6">
                <p className="text-sm text-[#7D746F]">Average Rating</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-2xl font-bold text-[#A31A11]">
                    {typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0'}
                  </p>
                  <div className="flex gap-1">
                    {renderStars(Math.round(stats.averageRating || 0))}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6">
                <p className="text-sm text-[#7D746F]">Product Reviews</p>
                <p className="mt-2 text-2xl font-bold text-[#1A1717]">
                  {stats.feedbackByType?.PRODUCT || 0}
                </p>
              </div>
              <div className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-6">
                <p className="text-sm text-[#7D746F]">Service Reviews</p>
                <p className="mt-2 text-2xl font-bold text-[#1A1717]">
                  {stats.feedbackByType?.SERVICE || 0}
                </p>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="rounded-lg border border-[#DED6D2] bg-[#FDFDFD] p-4">
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-[#7D746F]" />
              <select
                id="feedbackType"
                name="feedbackType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-[#DED6D2] bg-white px-4 py-2 text-[#1A1717] focus:border-[#A31A11] focus:outline-none"
              >
                {feedbackTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-[#A31A11]" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#DED6D2] bg-[#FDFDFD] p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-[#1A1717]">No reviews found</h3>
              <p className="mt-2 text-sm text-[#7D746F]">
                There are no reviews to moderate for this filter
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  id={`feedback-${feedback.id}`}
                  key={feedback.id}
                  className={`rounded-lg border transition-all ${
                    selectedFeedbackId === feedback.id
                      ? 'border-[#d946a6] bg-[#FDF5F5] ring-2 ring-[#d946a6] ring-opacity-50 shadow-lg'
                      : feedback.isRead
                      ? 'border-[#DED6D2] bg-[#FDFDFD]'
                      : 'border-[#A31A11]/30 bg-[#FDF5F5]'
                  } p-6 hover:shadow-md`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getReviewTypeColor(feedback.feedbackType)}`}>
                            {feedback.feedbackType}
                          </span>
                          {renderStars(feedback.rating)}
                          {!feedback.isRead && (
                            <span className="inline-block px-2 py-1 rounded-full bg-[#EF1F1F] text-xs font-semibold text-white">
                              NEW
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-[#1A1717]">
                          {feedback.userName || 'Anonymous Customer'}
                        </h4>
                        <p className="text-sm text-[#7D746F]">
                          {feedback.userEmail && `Email: ${feedback.userEmail}`}
                        </p>
                        <p className="text-xs text-[#7D746F] mt-1">
                          {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="rounded bg-white p-4 border border-[#E2D4CD]">
                      <p className="text-[#4C4542] leading-relaxed">{feedback.comment}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E2D4CD]">
                      {!feedback.isRead && (
                        <Button
                          onClick={() => handleApproveFeedback(feedback.id)}
                          disabled={approvingFeedbackId === feedback.id}
                          size="sm"
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {approvingFeedbackId === feedback.id ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <Check size={16} />
                              Approve Review
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteFeedback(feedback.id)}
                        disabled={isDeleting}
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
