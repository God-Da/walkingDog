package com.walkingdog.backend.controller;

import com.walkingdog.backend.dto.AirQualityResponse;
import com.walkingdog.backend.service.AirQualityService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/air")
public class AirQualityController {

    private final AirQualityService service;

    public AirQualityController(AirQualityService service) {
        this.service = service;
    }

    @GetMapping
    public AirQualityResponse getAir(
            @RequestParam double lat,
            @RequestParam double lon
    ) {
        return service.getAirQualityByLocation(lat, lon);
    }
}