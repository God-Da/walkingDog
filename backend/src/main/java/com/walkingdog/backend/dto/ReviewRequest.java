package com.walkingdog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    private Double latitude;
    private Double longitude;
    private String location;
    private Integer rating; // 1-5
    private String content;
}
