package com.walkingdog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationReviewsResponse {
    private Double latitude;
    private Double longitude;
    private String location;
    private Double averageRating;
    private Long reviewCount;
    private List<ReviewResponse> reviews;
}
