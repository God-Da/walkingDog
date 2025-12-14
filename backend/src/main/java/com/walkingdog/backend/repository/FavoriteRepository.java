package com.walkingdog.backend.repository;

import com.walkingdog.backend.entity.Favorite;
import com.walkingdog.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<Favorite> findByUserAndLatitudeAndLongitude(User user, Double latitude, Double longitude);
    
    boolean existsByUserAndLatitudeAndLongitude(User user, Double latitude, Double longitude);
}
