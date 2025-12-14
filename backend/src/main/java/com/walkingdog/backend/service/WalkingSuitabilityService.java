package com.walkingdog.backend.service;

import com.walkingdog.backend.dto.AirQualityResponse;
import com.walkingdog.backend.dto.WalkingSuitabilityResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WalkingSuitabilityService {

    @Autowired
    private AirQualityService airQualityService;

    @Autowired
    private WeatherService weatherService;

    public WalkingSuitabilityResponse calculateSuitability(double lat, double lon) {
        return calculateSuitability(lat, lon, null);
    }

    public WalkingSuitabilityResponse calculateSuitability(double lat, double lon, String address) {

        AirQualityResponse airQuality =
                airQualityService.getAirQualityByLocation(lat, lon, address);

        WeatherService.WeatherInfo weather =
                weatherService.getWeather(lat, lon);

        int pm10 = airQuality.getPm10Value();
        int pm25 = airQuality.getPm25Value();

        String status = determineStatus(pm10, pm25);

        WalkingSuitabilityResponse response = new WalkingSuitabilityResponse();
        response.setPm10Value(pm10);
        response.setPm25Value(pm25);
        response.setLocation(airQuality.getLocation());
        response.setStationName(airQuality.getStationName());
        response.setTemperature(weather.temperature);
        response.setSkyCondition(weather.skyCondition);
        response.setPrecipitation(weather.precipitation);
        response.setStatus(status);

        return response;
    }

    private String determineStatus(int pm10, int pm25) {
        if (pm10 > 150 || pm25 > 75) return "매우나쁨";
        if (pm10 > 80 || pm25 > 35) return "나쁨";
        if (pm10 > 30 || pm25 > 15) return "보통";
        return "좋음";
    }
}
