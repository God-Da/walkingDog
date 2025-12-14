package com.walkingdog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalkingSuitabilityResponse {
    private String status;  // 좋음, 보통, 나쁨, 매우나쁨
    private String statusCode;  // GOOD, NORMAL, BAD, VERY_BAD
    private int pm10Value;
    private int pm25Value;
    private String temperature;
    private String skyCondition;  // 맑음, 구름많음, 흐림
    private String precipitation;  // 없음, 비, 눈 등
    private String location;  // 사용자가 검색하거나 현재 위치 (주소)
    private String stationName;  // 측정소 이름
    private String message;
}



