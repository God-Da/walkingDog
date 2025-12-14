package com.walkingdog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Double latitude;
    private Double longitude;
    private String location;
    private Integer rating;
    private String content;
    private String username;
    private String userName; // 사용자 이름
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
