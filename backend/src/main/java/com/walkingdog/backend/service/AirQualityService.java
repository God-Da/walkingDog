package com.walkingdog.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.walkingdog.backend.dto.AirQualityResponse;
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
     * 위경도 기준 대기질 조회 (에어코리아 시도별 실시간)
     * ❗ 예외는 내부에서 처리 → Service 밖으로 던지지 않음
     */
    public AirQualityResponse getAirQualityByLocation(double lat, double lon) {

        logger.info("대기질 정보 조회: lat={}, lon={}", lat, lon);

        try {
            // 1️⃣ 위경도 → 시도명 (MVP용 단순 매핑)
            String sidoName = resolveSido(lat);

            // 2️⃣ API URL 생성
            String url = UriComponentsBuilder
                    .fromUriString("http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty")
                    .queryParam("serviceKey", apiKey)
                    .queryParam("returnType", "json")
                    .queryParam("numOfRows", 100)
                    .queryParam("pageNo", 1)
                    .queryParam("sidoName", sidoName)
                    .queryParam("ver", "1.3")
                    .build(false) // ⭐ serviceKey 이중 인코딩 방지
                    .toUriString();

            logger.debug("에어코리아 API URL: {}", url.replace(apiKey, "***"));

            // 3️⃣ API 호출
            String response = restTemplate.getForObject(url, String.class);

            JsonNode items = objectMapper.readTree(response)
                    .path("response")
                    .path("body")
                    .path("items");

            if (!items.isArray() || items.isEmpty()) {
                logger.warn("대기질 API 응답에 데이터 없음");
                return getMockAirQuality();
            }

            // 4️⃣ MVP: 첫 번째 측정소 기준
            JsonNode item = items.get(0);

            AirQualityResponse result = new AirQualityResponse();
            result.setPm10Value(parseValue(item.path("pm10Value").asText()));
            result.setPm25Value(parseValue(item.path("pm25Value").asText()));
            result.setLocation(item.path("stationName").asText());
            result.setKhaiGrade(item.path("khaiGrade").asText());
            result.setDataTime(item.path("dataTime").asText());

            logger.info(
                    "대기질 실데이터 반환: PM10={}, PM2.5={}, 측정소={}",
                    result.getPm10Value(),
                    result.getPm25Value(),
                    result.getLocation()
            );

            return result;

        } catch (Exception e) {
            // ❗ 외부 API 실패는 예외가 아니라 '상황'
            logger.warn("대기질 API 실패 → Mock 데이터 사용", e);
            return getMockAirQuality();
        }
    }

    /**
     * 위경도 → 시도명 (간단 매핑, MVP용)
     * ※ 나중에 '측정소정보 API + 거리 계산'으로 교체
     */
    private String resolveSido(double lat) {
        if (lat >= 37.5) return "서울";
        if (lat >= 36.0) return "경기";
        return "부산";
    }

    /**
     * 문자열 숫자 파싱
     */
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

    /**
     * Mock 데이터 (API 장애 대비)
     */
    private AirQualityResponse getMockAirQuality() {
        AirQualityResponse mock = new AirQualityResponse();
        mock.setPm10Value(30);
        mock.setPm25Value(18);
        mock.setLocation("MockStation");
        mock.setKhaiGrade("2");
        mock.setDataTime("MockTime");

        logger.info("Mock 대기질 데이터 반환");
        return mock;
    }
}
