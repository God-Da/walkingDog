package com.walkingdog.backend.controller;

import com.walkingdog.backend.dto.FavoriteRequest;
import com.walkingdog.backend.dto.FavoriteResponse;
import com.walkingdog.backend.entity.User;
import com.walkingdog.backend.service.FavoriteService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    private Long getUserId(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addFavorite(
            @RequestBody FavoriteRequest request,
            HttpSession session) {
        try {
            Long userId = getUserId(session);
            FavoriteResponse favorite = favoriteService.addFavorite(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "찜 목록에 추가되었습니다.");
            response.put("favorite", favorite);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            HttpSession session) {
        try {
            Long userId = getUserId(session);
            favoriteService.removeFavorite(userId, latitude, longitude);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "찜 목록에서 제거되었습니다.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyFavorites(HttpSession session) {
        try {
            Long userId = getUserId(session);
            List<FavoriteResponse> favorites = favoriteService.getUserFavorites(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("favorites", favorites);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkFavorite(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            HttpSession session) {
        try {
            Long userId = getUserId(session);
            boolean isFavorite = favoriteService.isFavorite(userId, latitude, longitude);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("isFavorite", isFavorite);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
