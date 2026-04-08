import React, { useEffect, useState } from 'react';
import { adminService } from '@/services/api';
import { toast } from 'sonner';
import { Trash2, Star, Filter, Loader, Check } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/common/AdminDashboardLayout';
import { useFeedback } from '@/context/FeedbackContext';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(null);
  const { decrementUnreadCount } = useFeedback();

  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, []);

  useEffect(() => {
    if (filterType === 'ALL') {
      setFilteredFeedbacks(feedbacks);
    } else {
      setFilteredFeedbacks(
        feedbacks.filter((f) => f.feedbackType === filterType)
      );
    }
  }, [filterType, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllFeedbacks();
      if (response.data.success) {
        setFeedbacks(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to load feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error(error.response?.data?.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getFeedbackStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await adminService.deleteFeedback(feedbackId);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        setFeedbacks(feedbacks.filter((f) => f.id !== feedbackId));
        setSelectedFeedback(null);
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

  const handleMarkAsRead = async (feedbackId) => {
    try {
      setIsMarkingAsRead(feedbackId);
      const response = await adminService.markFeedbackAsRead(feedbackId);
      if (response.data.success) {
        toast.success('Feedback marked as read');
        // Update the feedback in the list
        setFeedbacks(feedbacks.map((f) => 
          f.id === feedbackId ? { ...f, isRead: true } : f
        ));
        // Immediately decrement the sidebar badge count
        decrementUnreadCount();
      } else {
        toast.error(response.data.message || 'Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    } finally {
      setIsMarkingAsRead(null);
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

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(selectedFeedback?.id === feedback.id ? null : feedback);
  };

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-1">View and manage customer feedbacks</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#8E1616] to-[#A01C1C] text-white p-6 rounded-lg shadow">
              <p className="text-sm font-medium opacity-90">Total Feedbacks</p>
              <p className="text-3xl font-bold mt-2">{stats.totalFeedbacks || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-6 rounded-lg shadow">
              <p className="text-sm font-medium opacity-90">Average Rating</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold">{stats.averageRating || 0}</p>
                <Star size={20} className="fill-yellow-300 text-yellow-300" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#B84559] to-[#C9566B] text-white p-6 rounded-lg shadow">
              <p className="text-sm font-medium opacity-90">Service Feedback</p>
              <p className="text-3xl font-bold mt-2">
                {stats.feedbackByType?.SERVICE || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#BD8E78] to-[#D4A591] text-white p-6 rounded-lg shadow">
              <p className="text-sm font-medium opacity-90">Product Feedback</p>
              <p className="text-3xl font-bold mt-2">
                {stats.feedbackByType?.PRODUCT || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filter and Controls */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <Filter size={20} className="text-[#8E1616]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8E1616] focus:border-transparent outline-none"
          >
            <option value="ALL">All Feedbacks</option>
            <option value="SERVICE">Service Feedback</option>
            <option value="PRODUCT">Product Feedback</option>
            <option value="GENERAL">General Feedback</option>
          </select>

          <button
            onClick={() => {
              fetchFeedbacks();
              fetchStats();
            }}
            className="ml-auto px-4 py-2 bg-[#8E1616] text-white rounded-lg hover:bg-[#A01C1C] transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Feedbacks List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader size={32} className="animate-spin text-purple-600" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No feedbacks found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !feedback.isRead ? 'bg-amber-50 border-l-4 border-[#8E1616]' : ''
                  }`}
                >
                  <div
                    onClick={() => handleFeedbackClick(feedback)}
                    className="cursor-pointer"
                  >
                    {/* Header with rating and delete button */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-semibold text-gray-900">
                            {feedback.userName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {feedback.userEmail}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {renderStars(feedback.rating)}
                            <span className="text-sm text-gray-600 ml-1">
                              {feedback.rating}/5
                            </span>
                          </div>
                          <span className="text-xs px-3 py-1 bg-gray-200 text-gray-800 rounded-full">
                            {feedback.feedbackType}
                          </span>
                          {feedback.targetId && (
                            <span className="text-xs text-gray-600">
                              Target ID: {feedback.targetId}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(feedback.id);
                        }}
                        disabled={isMarkingAsRead === feedback.id || feedback.isRead}
                        className={`p-2 rounded-lg transition-colors ${
                          feedback.isRead
                            ? 'text-green-600 bg-green-50 cursor-default'
                            : 'text-[#8E1616] hover:text-[#A01C1C] hover:bg-amber-50'
                        } disabled:opacity-50`}
                        title={feedback.isRead ? 'Already marked as read' : 'Mark as read'}
                      >
                        <Check size={20} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFeedback(feedback.id);
                        }}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Date information */}
                    <p className="text-xs text-gray-500 mb-3">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </p>

                    {/* Comment preview */}
                    <p className="text-gray-700 line-clamp-2">
                      {feedback.comment}
                    </p>
                  </div>

                  {/* Expanded view */}
                  {selectedFeedback?.id === feedback.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Full Feedback
                      </h4>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {feedback.comment}
                      </p>

                      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                        <p>
                          <strong>Created:</strong>{' '}
                          {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                        {feedback.updatedAt && (
                          <p>
                            <strong>Last Updated:</strong>{' '}
                            {new Date(feedback.updatedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
