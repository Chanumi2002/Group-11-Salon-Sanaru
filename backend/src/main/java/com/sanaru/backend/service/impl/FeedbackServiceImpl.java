package com.sanaru.backend.service.impl;

import com.sanaru.backend.dto.FeedbackRequest;
import com.sanaru.backend.dto.FeedbackResponse;
import com.sanaru.backend.model.Feedback;
import com.sanaru.backend.model.User;
import com.sanaru.backend.repository.FeedbackRepository;
import com.sanaru.backend.repository.UserRepository;
import com.sanaru.backend.service.FeedbackService;
import com.sanaru.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackServiceImpl.class);

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public FeedbackResponse submitFeedback(Long userId, FeedbackRequest request) {
        // Validate request
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        if (request.getFeedbackType() == null || request.getFeedbackType().trim().isEmpty()) {
            throw new IllegalArgumentException("Feedback type is required");
        }

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));

        // Create feedback (validation for comment length is handled via @Valid annotation)
        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment().trim());
        feedback.setFeedbackType(request.getFeedbackType().toUpperCase());
        feedback.setTargetId(request.getTargetId());

        Feedback saved = feedbackRepository.save(feedback);
        FeedbackResponse response = mapToResponse(saved);

        // Send email notification to admin asynchronously (non-blocking)
        logger.info("Submitting async email notification for feedback ID: {}", saved.getId());
        emailService.sendReviewNotificationToAdmin(response);
        // Email will be sent in background - doesn't block user response

        return response;
    }

    @Override
    public List<FeedbackResponse> getMyFeedbacks(Long userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new NoSuchElementException("User not found with id: " + userId);
        }

        return feedbackRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackResponse getFeedbackById(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new NoSuchElementException("Feedback not found with id: " + feedbackId));
        return mapToResponse(feedback);
    }

    @Override
    public void deleteFeedback(Long feedbackId) {
        if (!feedbackRepository.existsById(feedbackId)) {
            throw new NoSuchElementException("Feedback not found with id: " + feedbackId);
        }
        feedbackRepository.deleteById(feedbackId);
    }

    @Override
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getFeedbacksByType(String feedbackType) {
        return feedbackRepository.findByFeedbackType(feedbackType.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getFeedbacksForTarget(Long targetId, String feedbackType) {
        return feedbackRepository.findByTargetIdAndFeedbackType(targetId, feedbackType.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getFeedbackStats() {
        List<Feedback> allFeedbacks = feedbackRepository.findAll();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFeedbacks", allFeedbacks.size());

        // Stats by type
        Map<String, Long> byType = allFeedbacks.stream()
                .collect(Collectors.groupingBy(Feedback::getFeedbackType, Collectors.counting()));
        stats.put("feedbackByType", byType);

        // Average rating
        double avgRating = allFeedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
        stats.put("averageRating", Math.round(avgRating * 100.0) / 100.0);

        // Rating distribution
        Map<Integer, Long> ratingDistribution = allFeedbacks.stream()
                .collect(Collectors.groupingBy(Feedback::getRating, Collectors.counting()));
        stats.put("ratingDistribution", ratingDistribution);

        return stats;
    }

    @Override
    public Map<String, Object> getTargetStats(Long targetId, String feedbackType) {
        List<Feedback> feedbacks = feedbackRepository.findByTargetIdAndFeedbackType(targetId, feedbackType.toUpperCase());

        Map<String, Object> stats = new HashMap<>();
        stats.put("targetId", targetId);
        stats.put("feedbackType", feedbackType);
        stats.put("totalReviews", feedbacks.size());

        if (feedbacks.isEmpty()) {
            stats.put("averageRating", 0.0);
            stats.put("ratingDistribution", new HashMap<>());
            return stats;
        }

        // Average rating
        double avgRating = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
        stats.put("averageRating", Math.round(avgRating * 100.0) / 100.0);

        // Rating distribution
        Map<Integer, Long> ratingDistribution = feedbacks.stream()
                .collect(Collectors.groupingBy(Feedback::getRating, Collectors.counting()));
        stats.put("ratingDistribution", ratingDistribution);

        return stats;
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setUserId(feedback.getUser().getId());
        response.setUserName(feedback.getUser().getFirstName() + " " + feedback.getUser().getLastName());
        response.setUserEmail(feedback.getUser().getEmail());
        response.setRating(feedback.getRating());
        response.setComment(feedback.getComment());
        response.setFeedbackType(feedback.getFeedbackType());
        response.setTargetId(feedback.getTargetId());
        response.setIsRead(feedback.getIsRead());
        response.setCreatedAt(feedback.getCreatedAt());
        response.setUpdatedAt(feedback.getUpdatedAt());
        return response;
    }

    @Override
    public FeedbackResponse approveFeedback(Long feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new NoSuchElementException("Feedback not found with id: " + feedbackId));
        
        feedback.setIsRead(true);
        Feedback updated = feedbackRepository.save(feedback);
        return mapToResponse(updated);
    }

    @Override
    public long getUnapprovedFeedbackCount() {
        return feedbackRepository.countByIsReadFalse();
    }

    @Override
    public List<FeedbackResponse> getUnapprovedFeedbacks() {
        return feedbackRepository.findByIsReadFalse().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackResponse> getApprovedFeedbacksByType(String feedbackType) {
        return feedbackRepository.findByFeedbackTypeAndIsReadTrue(feedbackType.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<FeedbackResponse> getApprovedFeedbacksForTarget(Long targetId, String feedbackType) {
        return feedbackRepository.findByTargetIdAndFeedbackTypeAndIsReadTrue(targetId, feedbackType.toUpperCase()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
