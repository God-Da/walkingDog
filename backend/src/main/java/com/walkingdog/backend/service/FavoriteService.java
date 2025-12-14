package com.walkingdog.backend.service;

import com.walkingdog.backend.dto.FavoriteRequest;
import com.walkingdog.backend.dto.FavoriteResponse;
import com.walkingdog.backend.entity.Favorite;
import com.walkingdog.backend.entity.User;
import com.walkingdog.backend.repository.FavoriteRepository;
import com.walkingdog.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public FavoriteResponse addFavorite(Long userId, FavoriteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 이미 찜한 위치인지 확인
        if (favoriteRepository.existsByUserAndLatitudeAndLongitude(
                user, request.getLatitude(), request.getLongitude())) {
            throw new RuntimeException("이미 찜한 위치입니다.");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .location(request.getLocation())
                .build();

        Favorite saved = favoriteRepository.save(favorite);
        return toResponse(saved);
    }

    @Transactional
    public void removeFavorite(Long userId, Double latitude, Double longitude) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Favorite favorite = favoriteRepository
                .findByUserAndLatitudeAndLongitude(user, latitude, longitude)
                .orElseThrow(() -> new RuntimeException("찜한 위치를 찾을 수 없습니다."));

        favoriteRepository.delete(favorite);
    }

    public List<FavoriteResponse> getUserFavorites(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return favoriteRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public boolean isFavorite(Long userId, Double latitude, Double longitude) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return favoriteRepository.existsByUserAndLatitudeAndLongitude(user, latitude, longitude);
    }

    private FavoriteResponse toResponse(Favorite favorite) {
        return FavoriteResponse.builder()
                .id(favorite.getId())
                .latitude(favorite.getLatitude())
                .longitude(favorite.getLongitude())
                .location(favorite.getLocation())
                .createdAt(favorite.getCreatedAt())
                .build();
    }
}
