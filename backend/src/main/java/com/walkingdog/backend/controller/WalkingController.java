package com.walkingdog.backend.controller;

import com.walkingdog.backend.dto.WalkingSuitabilityResponse;
import com.walkingdog.backend.service.WalkingSuitabilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class WalkingController {

    private static final Logger logger = LoggerFactory.getLogger(WalkingController.class);

    @Autowired
    private WalkingSuitabilityService walkingSuitabilityService;

    @GetMapping("/walking/suitability")
    public ResponseEntity<?> getWalkingSuitability(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(required = false) String address) {
        try {
            logger.info("산책 적합도 조회 요청: lat={}, lon={}, address={}", lat, lon, address);
            WalkingSuitabilityResponse response = walkingSuitabilityService.calculateSuitability(lat, lon, address);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("산책 적합도 조회 실패: lat={}, lon={}", lat, lon, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("산책 적합도 조회 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    private static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
    }
}
