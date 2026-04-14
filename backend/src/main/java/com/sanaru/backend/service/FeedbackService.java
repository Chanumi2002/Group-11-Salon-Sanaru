package com.sanaru.backend.service;

import com.sanaru.backend.dto.FeedbackRequest;
import com.sanaru.backend.dto.FeedbackResponse;

import java.util.List;
import java.util.Map;

public interface FeedbackService {

    // Customer operations
    FeedbackResponse submitFeedback(Long userId, FeedbackRequest request);

    List<FeedbackResponse> getMyFeedbacks(Long userId);

    FeedbackResponse getFeedbackById(Long feedbackId);

    void deleteFeedback(Long feedbackId);

    // Admin operations
    List<FeedbackResponse> getAllFeedbacks();

    List<FeedbackResponse> getFeedbacksByType(String feedbackType);

    List<FeedbackResponse> getFeedbacksForTarget(Long targetId, String feedbackType);

    Map<String, Object> getFeedbackStats();

    Map<String, Object> getTargetStats(Long targetId, String feedbackType);

    // Approve feedback (formerly markFeedbackAsRead)
    FeedbackResponse approveFeedback(Long feedbackId);

    // Get count of unread/unapproved feedbacks
    long getUnapprovedFeedbackCount();

    // Get list of unread/unapproved feedbacks
    List<FeedbackResponse> getUnapprovedFeedbacks();
    
    // Get only approved feedbacks for public display
    List<FeedbackResponse> getApprovedFeedbacksByType(String feedbackType);
    
    List<FeedbackResponse> getApprovedFeedbacksForTarget(Long targetId, String feedbackType);
}
