package com.walkingdog.backend.repository;

import com.walkingdog.backend.entity.Review;
import com.walkingdog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUserOrderByCreatedAtDesc(User user);
    
    List<Review> findByLatitudeAndLongitudeOrderByCreatedAtDesc(Double latitude, Double longitude);
    
    Optional<Review> findByUserAndLatitudeAndLongitude(User user, Double latitude, Double longitude);
    
    long countByLatitudeAndLongitude(Double latitude, Double longitude);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.latitude = :latitude AND r.longitude = :longitude")
    Double findAverageRatingByLatitudeAndLongitude(@Param("latitude") Double latitude, @Param("longitude") Double longitude);
}
