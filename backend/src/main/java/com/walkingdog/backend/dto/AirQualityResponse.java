package com.walkingdog.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AirQualityResponse {
    private String stationName;
    private String pm10Value;  // PM10 농도
    private String pm25Value;  // PM2.5 농도
    private String pm10Grade;  // PM10 등급
    private String pm25Grade;  // PM2.5 등급
    private String dataTime;   // 측정 시간
}

