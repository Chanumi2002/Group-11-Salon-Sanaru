package com.sanaru.backend.controller;

import com.sanaru.backend.dto.FeedbackRequest;
import com.sanaru.backend.dto.FeedbackResponse;
import com.sanaru.backend.model.User;
import com.sanaru.backend.service.FeedbackService;
import com.sanaru.backend.service.UserService;
import com.sanaru.backend.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserService userService;

    // ==================== CUSTOMER ENDPOINTS ====================

    /**
     * Submit feedback (Customer)
     * POST /api/customer/feedback
     */
    @PostMapping("/customer/feedback")
    public ResponseEntity<Map<String, Object>> submitFeedback(
            @RequestBody FeedbackRequest request,
            Authentication authentication
    ) {
        // Scenario 4: Check if user is authenticated (guest attempt)
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required to submit feedback"
                    ));
        }

        try {
            Long userId = extractUserId(authentication);
            FeedbackResponse feedback = feedbackService.submitFeedback(userId, request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Feedback submitted successfully",
                            "data", feedback
                    ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage()
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error submitting feedback: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get my feedbacks (Customer)
     * GET /api/customer/feedbacks
     */
    @GetMapping("/customer/feedbacks")
    public ResponseEntity<Map<String, Object>> getMyFeedbacks(Authentication authentication) {
        try {
            Long userId = extractUserId(authentication);
            List<FeedbackResponse> feedbacks = feedbackService.getMyFeedbacks(userId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedbacks retrieved successfully",
                    "data", feedbacks
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving feedbacks: " + e.getMessage()
                    ));
        }
    }

    /**
     * Delete my feedback (Customer)
     * DELETE /api/customer/feedback/{feedbackId}
     */
    @DeleteMapping("/customer/feedback/{feedbackId}")
    public ResponseEntity<Map<String, Object>> deleteFeedback(
            @PathVariable Long feedbackId,
            Authentication authentication
    ) {
        try {
            Long userId = extractUserId(authentication);
            FeedbackResponse feedback = feedbackService.getFeedbackById(feedbackId);

            // Verify ownership
            if (!feedback.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "You can only delete your own feedbacks"
                        ));
            }

            feedbackService.deleteFeedback(feedbackId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedback deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error deleting feedback: " + e.getMessage()
                    ));
        }
    }

    // ==================== PUBLIC ENDPOINTS (Guest & Customer Access) ====================

    /**
     * Get all reviews for all products (Public)
     * GET /api/reviews/product
     */
    @GetMapping("/reviews/product")
    public ResponseEntity<Map<String, Object>> getAllProductReviews() {
        try {
            // Fetch all product reviews
            List<FeedbackResponse> allReviews = feedbackService.getFeedbacksByType("PRODUCT");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "All product reviews retrieved successfully",
                    "data", allReviews
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving reviews: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get all reviews for all services (Public)
     * GET /api/reviews/service
     */
    @GetMapping("/reviews/service")
    public ResponseEntity<Map<String, Object>> getAllServiceReviews() {
        try {
            // Fetch all service reviews
            List<FeedbackResponse> allReviews = feedbackService.getFeedbacksByType("SERVICE");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "All service reviews retrieved successfully",
                    "data", allReviews
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving reviews: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get reviews for a product (Public)
     * GET /api/reviews/product/{productId}
     * Scenario 1: View Product Reviews - accessible to all users including guests
     */
    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<Map<String, Object>> getProductReviews(@PathVariable Long productId) {
        try {
            List<FeedbackResponse> reviews = feedbackService.getFeedbacksForTarget(productId, "PRODUCT");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Product reviews retrieved successfully",
                    "data", reviews
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving reviews: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get reviews for a service (Public)
     * GET /api/reviews/service/{serviceId}
     * Scenario 2: View Service Reviews - accessible to all users including guests
     */
    @GetMapping("/reviews/service/{serviceId}")
    public ResponseEntity<Map<String, Object>> getServiceReviews(@PathVariable Long serviceId) {
        try {
            List<FeedbackResponse> reviews = feedbackService.getFeedbacksForTarget(serviceId, "SERVICE");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Service reviews retrieved successfully",
                    "data", reviews
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving reviews: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get aggregated statistics for a product (Public)
     * GET /api/reviews/stats/product/{productId}
     */
    @GetMapping("/reviews/stats/product/{productId}")
    public ResponseEntity<Map<String, Object>> getProductReviewStats(@PathVariable Long productId) {
        try {
            Map<String, Object> stats = feedbackService.getTargetStats(productId, "PRODUCT");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Product statistics retrieved successfully",
                    "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving statistics: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get aggregated statistics for a service (Public)
     * GET /api/reviews/stats/service/{serviceId}
     */
    @GetMapping("/reviews/stats/service/{serviceId}")
    public ResponseEntity<Map<String, Object>> getServiceReviewStats(@PathVariable Long serviceId) {
        try {
            Map<String, Object> stats = feedbackService.getTargetStats(serviceId, "SERVICE");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Service statistics retrieved successfully",
                    "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving statistics: " + e.getMessage()
                    ));
        }
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Get all feedbacks (Admin)
     * GET /api/admin/feedbacks
     */
    @GetMapping("/admin/feedbacks")
    public ResponseEntity<Map<String, Object>> getAllFeedbacks(Authentication authentication) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can access feedbacks"
                        ));
            }

            List<FeedbackResponse> feedbacks = feedbackService.getAllFeedbacks();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "All feedbacks retrieved successfully",
                    "data", feedbacks
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving feedbacks: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get feedback by ID (Admin)
     * GET /api/admin/feedback/{feedbackId}
     */
    @GetMapping("/admin/feedback/{feedbackId}")
    public ResponseEntity<Map<String, Object>> getFeedbackById(@PathVariable Long feedbackId, Authentication authentication) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can access feedback"
                        ));
            }

            FeedbackResponse feedback = feedbackService.getFeedbackById(feedbackId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedback retrieved successfully",
                    "data", feedback
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Feedback not found: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get feedbacks by type (Admin)
     * GET /api/admin/feedbacks?type=SERVICE
     */
    @GetMapping("/admin/feedbacks/type")
    public ResponseEntity<Map<String, Object>> getFeedbacksByType(
            @RequestParam(value = "type") String feedbackType,
            Authentication authentication
    ) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can access feedbacks"
                        ));
            }

            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksByType(feedbackType);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedbacks of type " + feedbackType + " retrieved successfully",
                    "data", feedbacks
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving feedbacks: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get feedbacks for a specific target (e.g., service or product) (Admin)
     * GET /api/admin/feedbacks/target/{targetId}?type=SERVICE
     */
    @GetMapping("/admin/feedbacks/target/{targetId}")
    public ResponseEntity<Map<String, Object>> getFeedbacksForTarget(
            @PathVariable Long targetId,
            @RequestParam(value = "type") String feedbackType,
            Authentication authentication
    ) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can access feedbacks"
                        ));
            }

            List<FeedbackResponse> feedbacks = feedbackService.getFeedbacksForTarget(targetId, feedbackType);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedbacks for target retrieved successfully",
                    "data", feedbacks
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving feedbacks: " + e.getMessage()
                    ));
        }
    }

    /**
     * Delete feedback (Admin)
     * DELETE /api/admin/feedback/{feedbackId}
     * Scenario 2: Only admin can delete (return 403 for non-admin)
     */
    @DeleteMapping("/admin/feedback/{feedbackId}")
    public ResponseEntity<Map<String, Object>> adminDeleteFeedback(
            @PathVariable Long feedbackId,
            Authentication authentication
    ) {
        // Check authorization - only admin can delete
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can delete feedbacks"
                        ));
            }

            feedbackService.deleteFeedback(feedbackId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedback deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error deleting feedback: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get feedback statistics (Admin)
     * GET /api/admin/feedbacks/stats/general
     */
    @GetMapping("/admin/feedbacks/stats/general")
    public ResponseEntity<Map<String, Object>> getFeedbackStats(Authentication authentication) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can access statistics"
                        ));
            }

            Map<String, Object> stats = feedbackService.getFeedbackStats();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedback statistics retrieved successfully",
                    "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving statistics: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get total feedback count (Admin)
     * GET /api/admin/feedbacks/count
     * Used for displaying live badge on sidebar - shows UNREAD count
     */
    @GetMapping("/admin/feedbacks/count")
    public ResponseEntity<Map<String, Object>> getFeedbackCount(Authentication authentication) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can access feedback count"
                        ));
            }

            long unreadCount = feedbackService.getUnreadFeedbackCount();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedback count retrieved successfully",
                    "data", Map.of(
                            "unreadCount", unreadCount,
                            "hasUnread", unreadCount > 0
                    )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving feedback count: " + e.getMessage()
                    ));
        }
    }

    /**
     * Mark feedback as read (Admin)
     * PUT /api/admin/feedback/{feedbackId}/mark-read
     */
    @PutMapping("/admin/feedback/{feedbackId}/mark-read")
    public ResponseEntity<Map<String, Object>> markFeedbackAsRead(
            @PathVariable Long feedbackId,
            Authentication authentication
    ) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can mark feedback as read"
                        ));
            }

            FeedbackResponse feedback = feedbackService.markFeedbackAsRead(feedbackId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Feedback marked as read successfully",
                    "data", feedback
            ));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Feedback not found with id: " + feedbackId
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error marking feedback as read: " + e.getMessage()
                    ));
        }
    }

    /**
     * Get statistics for a specific target (Admin)
     * GET /api/admin/feedbacks/stats/target/{targetId}?type=SERVICE
     */
    @GetMapping("/admin/feedbacks/stats/target/{targetId}")
    public ResponseEntity<Map<String, Object>> getTargetStats(
            @PathVariable Long targetId,
            @RequestParam(value = "type") String feedbackType,
            Authentication authentication
    ) {
        // Check authorization - only admin can access
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "success", false,
                            "message", "Unauthorized - Authentication required"
                    ));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            // Verify user is admin
            if (user.getRole() != Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "success", false,
                                "message", "Forbidden - Only admins can access statistics"
                        ));
            }

            Map<String, Object> stats = feedbackService.getTargetStats(targetId, feedbackType);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Target statistics retrieved successfully",
                    "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving statistics: " + e.getMessage()
                    ));
        }
    }

    // Helper method to extract user ID from authentication
    private Long extractUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return user.getId();
    }
}
