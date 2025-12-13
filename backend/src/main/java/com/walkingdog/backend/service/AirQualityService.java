package com.walkingdog.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


@Service
public class AirQualityService {

    private static final Logger logger = LoggerFactory.getLogger(AirQualityService.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${public.data.api.key}")
    private String apiKey;

    /**
     * 대기질 정보 조회 (에어코리아 시도별 실시간)
     */
    public AirQualityInfo getAirQuality(double lat, double lon) {
        logger.info("대기질 정보 조회: lat={}, lon={}", lat, lon);

        try {
            // 👉 1단계: 위경도 → 시도명 (간단 버전)
            String sidoName = resolveSido(lat);

            String url = UriComponentsBuilder
                    .fromUriString("http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty")
                    .queryParam("serviceKey", apiKey)
                    .queryParam("returnType", "json")
                    .queryParam("numOfRows", 100)
                    .queryParam("pageNo", 1)
                    .queryParam("sidoName", sidoName)
                    .queryParam("ver", "1.3")
                    .build(false)   // ⭐ 이중 인코딩 방지
                    .toUriString();


            logger.debug("에어코리아 API URL: {}", url.replace(apiKey, "***"));

            String response = restTemplate.getForObject(url, String.class);

            JsonNode items = objectMapper.readTree(response)
                    .path("response")
                    .path("body")
                    .path("items");

            if (!items.isArray() || items.isEmpty()) {
                logger.warn("대기질 API 응답에 데이터 없음");
                return null;
            }

            // 👉 첫 번째 측정소 기준 (MVP용)
            JsonNode item = items.get(0);

            AirQualityInfo info = new AirQualityInfo();
            info.pm10 = item.path("pm10Value").asText();
            info.pm25 = item.path("pm25Value").asText();
            info.stationName = item.path("stationName").asText();
            info.khaiGrade = item.path("khaiGrade").asText();
            info.dataTime = item.path("dataTime").asText();

            logger.info(
                    "대기질 실데이터 반환: PM10={}, PM2.5={}, 측정소={}",
                    info.pm10, info.pm25, info.stationName
            );

            return info;

        } catch (Exception e) {
            logger.warn("대기질 API 실패 → Mock 사용: {}", e.getMessage());
            return getMockAirQuality();
        }
    }

    /**
     * 위경도 → 시도명 (간단 매핑)
     * ※ MVP 단계용, 나중에 리버스 지오코딩으로 교체 가능
     */
    private String resolveSido(double lat) {
        if (lat >= 37.0) return "서울";
        if (lat >= 36.0) return "경기";
        return "부산";
    }

    /**
     * Mock 데이터 (API 장애 대비)
     */
    private AirQualityInfo getMockAirQuality() {
        AirQualityInfo info = new AirQualityInfo();
        info.pm10 = "30";
        info.pm25 = "18";
        info.stationName = "MockStation";
        info.khaiGrade = "2";
        info.dataTime = "MockTime";

        logger.info("Mock 대기질 데이터 반환");
        return info;
    }

    /**
     * 대기질 DTO
     */
    public static class AirQualityInfo {
        public String pm10;
        public String pm25;
        public String stationName;
        public String khaiGrade;
        public String dataTime;
    }
}
