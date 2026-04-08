import React, { useState } from 'react';
import { customerService } from '@/services/api';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewForm({ onReviewAdded, onCancel }) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    feedbackType: 'PRODUCT',
    targetId: null,
  });
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const feedbackTypes = [
    { value: 'PRODUCT', label: 'Product' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'EXPERIENCE', label: 'Experience' },
    { value: 'STAFF', label: 'Staff' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (formData.comment.length < 10) {
      toast.error('Comment must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await customerService.submitFeedback(formData);
      
      if (response.data.success) {
        toast.success('Review submitted successfully!');
        if (onReviewAdded) {
          onReviewAdded(response.data.data);
        }
        setFormData({
          rating: 5,
          comment: '',
          feedbackType: 'PRODUCT',
          targetId: null,
        });
      } else {
        toast.error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback Type */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1717] mb-2">
          What are you reviewing? *
        </label>
        <select
          name="feedbackType"
          value={formData.feedbackType}
          onChange={handleChange}
          className="w-full rounded-lg border border-[#DED6D2] bg-[#FDFDFD] px-4 py-3 text-[#1A1717] focus:border-[#A31A11] focus:outline-none transition"
        >
          {feedbackTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1717] mb-2">
          Rating *
        </label>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={
                  star <= (hoveredRating || formData.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-[#7D746F]">
          {formData.rating} out of 5 stars
        </p>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1717] mb-2">
          Your Review * (minimum 10 characters)
        </label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Share your experience with us... What did you like? What can we improve?"
          rows={5}
          className="w-full rounded-lg border border-[#DED6D2] bg-[#FDFDFD] px-4 py-3 text-[#1A1717] placeholder-[#8D8681] focus:border-[#A31A11] focus:outline-none transition resize-none"
        />
        <p className="mt-2 text-xs text-[#7D746F]">
          {formData.comment.length} characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#EF1F1F] hover:bg-[#D91A1A] text-white"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
