import React, { useEffect, useState } from 'react';
import { customerService } from '@/services/api';
import { toast } from 'sonner';
import { Trash2, Star, Loader } from 'lucide-react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import FeedbackForm from '@/components/FeedbackForm';

export default function CustomerFeedbackPage() {
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMyFeedbacks();
  }, []);

  const fetchMyFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await customerService.getMyFeedbacks();
      if (response.data.success) {
        setMyFeedbacks(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      // Don't show error if it's just empty
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load feedbacks');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await customerService.deleteMyFeedback(feedbackId);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        setMyFeedbacks(myFeedbacks.filter((f) => f.id !== feedbackId));
      } else {
        toast.error(response.data.message || 'Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to delete feedback');
    } finally {
      setIsDeleting(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Feedback Form Section */}
          <div>
            <FeedbackForm />
          </div>

          {/* My Feedbacks Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Feedbacks</h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader size={32} className="animate-spin text-purple-600" />
              </div>
            ) : myFeedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p className="text-lg">You haven't submitted any feedbacks yet</p>
                <p className="text-sm mt-2">
                  Use the form above to share your experience
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            {renderStars(feedback.rating)}
                            <span className="text-sm text-gray-600 ml-1">
                              {feedback.rating}/5
                            </span>
                          </div>
                          <span className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                            {feedback.feedbackType}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}{' '}
                          {new Date(feedback.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteFeedback(feedback.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Feedback Content */}
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {feedback.comment}
                    </p>

                    {/* Target Information */}
                    {feedback.targetId && (
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        <span>{feedback.feedbackType} ID: {feedback.targetId}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
