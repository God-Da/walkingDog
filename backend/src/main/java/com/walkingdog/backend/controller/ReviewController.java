package com.walkingdog.backend.controller;

import com.walkingdog.backend.dto.LocationReviewsResponse;
import com.walkingdog.backend.dto.ReviewRequest;
import com.walkingdog.backend.dto.ReviewResponse;
import com.walkingdog.backend.entity.User;
import com.walkingdog.backend.service.ReviewService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    private Long getUserId(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addOrUpdateReview(
            @RequestBody ReviewRequest request,
            HttpSession session) {
        try {
            Long userId = getUserId(session);
            
            // 별점 검증
            if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "별점은 1-5 사이의 값이어야 합니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            ReviewResponse review = reviewService.addOrUpdateReview(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "리뷰가 저장되었습니다.");
            response.put("review", review);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, Object>> deleteReview(
            @PathVariable Long reviewId,
            HttpSession session) {
        try {
            Long userId = getUserId(session);
            reviewService.deleteReview(userId, reviewId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "리뷰가 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyReviews(HttpSession session) {
        try {
            Long userId = getUserId(session);
            List<ReviewResponse> reviews = reviewService.getUserReviews(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reviews", reviews);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/location")
    public ResponseEntity<Map<String, Object>> getLocationReviews(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        try {
            LocationReviewsResponse locationReviews = reviewService.getLocationReviews(latitude, longitude);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", locationReviews);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
