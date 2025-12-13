package com.walkingdog.backend.service;

import com.walkingdog.backend.dto.AirQualityResponse;
import com.walkingdog.backend.dto.WalkingSuitabilityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.walkingdog.backend.service.AirQualityService.AirQualityInfo;

@Service
public class WalkingSuitabilityService {

    @Autowired
    private AirQualityService airQualityService;

    @Autowired
    private WeatherService weatherService;

    public WalkingSuitabilityResponse calculateSuitability(double lat, double lon) {

        AirQualityInfo airQuality = airQualityService.getAirQuality(lat, lon);
        WeatherService.WeatherInfo weather = weatherService.getWeather(lat, lon);

        int pm10 = parseValue(airQuality.pm10);
        int pm25 = parseValue(airQuality.pm25);

        String status = determineStatus(pm10, pm25);

        WalkingSuitabilityResponse response = new WalkingSuitabilityResponse();
        response.setPm10Value(pm10);
        response.setPm25Value(pm25);
        response.setLocation(airQuality.stationName);
        response.setTemperature(weather.temperature);
        response.setSkyCondition(weather.skyCondition);
        response.setPrecipitation(weather.precipitation);
        response.setStatus(status);

        return response;
    }

    private int parseValue(String value) {
        try {
            if (value == null || value.isBlank() || "-".equals(value)) {
                return 0;
            }
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private String determineStatus(int pm10, int pm25) {
        if (pm10 > 150 || pm25 > 75) return "매우나쁨";
        if (pm10 > 80 || pm25 > 35) return "나쁨";
        if (pm10 > 30 || pm25 > 15) return "보통";
        return "좋음";
    }

    private String getMessage(String status) {
        return switch (status) {
            case "좋음" -> "산책하기 좋은 날씨입니다 🐕";
            case "보통" -> "산책은 가능하지만 민감한 강아지는 주의하세요.";
            case "나쁨" -> "미세먼지가 높아 산책을 자제하는 것이 좋아요.";
            case "매우나쁨" -> "대기질이 매우 나쁩니다. 실내 활동을 추천해요.";
            default -> "대기질 정보를 확인 중입니다.";
        };
    }

}

