package com.walkingdog.backend.service;

import com.walkingdog.backend.dto.ReviewRequest;
import com.walkingdog.backend.dto.ReviewResponse;
import com.walkingdog.backend.dto.LocationReviewsResponse;
import com.walkingdog.backend.entity.Review;
import com.walkingdog.backend.entity.User;
import com.walkingdog.backend.repository.ReviewRepository;
import com.walkingdog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ReviewResponse addOrUpdateReview(Long userId, ReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 기존 리뷰가 있는지 확인
        Review review = reviewRepository
                .findByUserAndLatitudeAndLongitude(user, request.getLatitude(), request.getLongitude())
                .orElse(null);

        if (review != null) {
            // 기존 리뷰 업데이트
            review.setRating(request.getRating());
            review.setContent(request.getContent());
            review = reviewRepository.save(review);
        } else {
            // 새 리뷰 생성
            review = Review.builder()
                    .user(user)
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .location(request.getLocation())
                    .rating(request.getRating())
                    .content(request.getContent())
                    .build();
            review = reviewRepository.save(review);
        }

        return toResponse(review);
    }

    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인의 리뷰만 삭제할 수 있습니다.");
        }

        reviewRepository.delete(review);
    }

    public List<ReviewResponse> getUserReviews(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return reviewRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LocationReviewsResponse getLocationReviews(Double latitude, Double longitude) {
        List<Review> reviews = reviewRepository
                .findByLatitudeAndLongitudeOrderByCreatedAtDesc(latitude, longitude);

        Double averageRating = reviewRepository
                .findAverageRatingByLatitudeAndLongitude(latitude, longitude);
        if (averageRating == null) {
            averageRating = 0.0;
        }

        long reviewCount = reviewRepository.countByLatitudeAndLongitude(latitude, longitude);

        String location = reviews.isEmpty() ? "" : reviews.get(0).getLocation();

        return LocationReviewsResponse.builder()
                .latitude(latitude)
                .longitude(longitude)
                .location(location)
                .averageRating(averageRating)
                .reviewCount(reviewCount)
                .reviews(reviews.stream().map(this::toResponse).collect(Collectors.toList()))
                .build();
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .latitude(review.getLatitude())
                .longitude(review.getLongitude())
                .location(review.getLocation())
                .rating(review.getRating())
                .content(review.getContent())
                .username(review.getUser().getUsername())
                .userName(review.getUser().getName())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
