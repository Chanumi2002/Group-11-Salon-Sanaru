package com.sanaru.backend.repository;

import com.sanaru.backend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // Find all feedbacks by a user
    List<Feedback> findByUserId(Long userId);

    // Find all feedbacks of a specific type
    List<Feedback> findByFeedbackType(String feedbackType);

    // Find all feedbacks for a specific target (service/product)
    List<Feedback> findByTargetId(Long targetId);

    // Find all feedbacks for a target of a specific type
    List<Feedback> findByTargetIdAndFeedbackType(Long targetId, String feedbackType);

    // Get average rating for a target
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.targetId = :targetId AND f.feedbackType = :feedbackType")
    Double getAverageRatingByTargetAndType(@Param("targetId") Long targetId, @Param("feedbackType") String feedbackType);

    // Count feedbacks for a target
    long countByTargetIdAndFeedbackType(Long targetId, String feedbackType);

    // Get all feedbacks ordered by creation date (newest first)
    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findAllOrderByCreatedAtDesc();

    // Find all unread/unapproved feedbacks
    List<Feedback> findByIsReadFalse();

    // Count unread/unapproved feedbacks
    long countByIsReadFalse();

    // Find unread feedbacks by type
    List<Feedback> findByIsReadFalseAndFeedbackType(String feedbackType);
    
    // ========== APPROVED FEEDBACKS (for public display) ==========
    
    // Find all approved feedbacks of a specific type
    List<Feedback> findByFeedbackTypeAndIsReadTrue(String feedbackType);
    
    // Find all approved feedbacks for a target of a specific type
    List<Feedback> findByTargetIdAndFeedbackTypeAndIsReadTrue(Long targetId, String feedbackType);
}
