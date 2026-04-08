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

    // Mark feedback as read
    FeedbackResponse markFeedbackAsRead(Long feedbackId);

    // Get count of unread feedbacks
    long getUnreadFeedbackCount();

    // Get list of unread feedbacks
    List<FeedbackResponse> getUnreadFeedbacks();
}
