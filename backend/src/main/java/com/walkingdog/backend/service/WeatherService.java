package com.walkingdog.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

@Service
public class WeatherService {

    private static final Logger logger = LoggerFactory.getLogger(WeatherService.class);
    private final Random random = new Random();
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${public.data.api.key:}")
    private String apiKey;

    public WeatherService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 날씨 정보 조회
     * 실제 API를 호출하고, 실패 시 Mock 데이터를 반환합니다.
     * 
     * 엔드포인트: http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst
     * API 키: application.properties의 public.data.api.key 사용
     */
    public WeatherInfo getWeather(double lat, double lon) {
        logger.info("날씨 정보 조회: lat={}, lon={}", lat, lon);
        
        // 실제 API 호출 시도
        try {
            if (apiKey != null && !apiKey.isEmpty() && !apiKey.contains("your-api-key")) {
                WeatherInfo apiResponse = callWeatherApi(lat, lon);
                if (apiResponse != null) {
                    logger.info("실제 API 날씨 데이터 반환: 기온={}°C, 하늘={}", 
                        apiResponse.temperature, apiResponse.skyCondition);
                    return apiResponse;
                }
            }
        } catch (Exception e) {
            logger.warn("API 호출 실패, Mock 데이터 사용: {}", e.getMessage());
        }
        
        // API 호출 실패 시 Mock 데이터 반환
        return getMockWeather();
    }

    /**
     * 실제 기상청 API 호출
     */
    private WeatherInfo callWeatherApi(double lat, double lon) {
        try {
            GridCoordinate grid = convertToGrid(lat, lon);

            LocalDateTime now = LocalDateTime.now().minusMinutes(40);
            String baseDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String baseTime = now.format(DateTimeFormatter.ofPattern("HH00"));

            String url = UriComponentsBuilder
                    .fromUriString("http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst")
                    .queryParam("serviceKey", apiKey)
                    .queryParam("pageNo", 1)
                    .queryParam("numOfRows", 100)
                    .queryParam("dataType", "JSON")
                    .queryParam("base_date", baseDate)
                    .queryParam("base_time", baseTime)
                    .queryParam("nx", grid.nx)
                    .queryParam("ny", grid.ny)
                    .build(false)   // ⭐ 이중 인코딩 방지
                    .toUriString();


            logger.debug("기상청 API URL: {}", url.replace(apiKey, "***"));

            String responseStr = restTemplate.getForObject(url, String.class);

            JsonNode body = objectMapper.readTree(responseStr)
                    .path("response")
                    .path("body");

            JsonNode items = body.path("items").path("item");

            if (!items.isArray() || items.isEmpty()) {
                logger.warn("기상청 API 응답에 데이터가 없습니다.");
                return null;
            }

            WeatherInfo weather = new WeatherInfo();

            for (JsonNode item : items) {
                String category = item.path("category").asText();
                String obsValue = item.path("obsrValue").asText();

                switch (category) {
                    case "T1H":
                        weather.temperature = obsValue;
                        break;
                    case "SKY":
                        weather.skyCode = obsValue;
                        weather.skyCondition = getSkyCondition(obsValue);
                        break;
                    case "PTY":
                        weather.precipitationCode = obsValue;
                        weather.precipitation = getPrecipitation(obsValue);
                        break;
                }
            }

            if (weather.temperature == null) weather.temperature = "20";
            if (weather.skyCondition == null) weather.skyCondition = "맑음";
            if (weather.precipitation == null) weather.precipitation = "없음";

            return weather;

        } catch (Exception e) {
            logger.error("기상청 API 호출 중 오류", e);
            return null;
        }
    }


    /**
     * 위경도를 기상청 격자 좌표로 변환
     */
    private GridCoordinate convertToGrid(double lat, double lon) {
        // 기상청 격자 좌표 변환 공식
        double RE = 6371.00877; // 지구 반경(km)
        double GRID = 5.0; // 격자 간격(km)
        double SLAT1 = 30.0; // 투영 위도1(degree)
        double SLAT2 = 60.0; // 투영 위도2(degree)
        double OLON = 126.0; // 기준점 경도(degree)
        double OLAT = 38.0; // 기준점 위도(degree)
        double XO = 43; // 기준점 X좌표(GRID)
        double YO = 136; // 기준점 Y좌표(GRID)

        double DEGRAD = Math.PI / 180.0;
        double RADDEG = 180.0 / Math.PI;

        double re = RE / GRID;
        double slat1 = SLAT1 * DEGRAD;
        double slat2 = SLAT2 * DEGRAD;
        double olon = OLON * DEGRAD;
        double olat = OLAT * DEGRAD;

        double sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
        double sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
        sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
        double ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
        ro = re * sf / Math.pow(ro, sn);

        double ra = Math.tan(Math.PI * 0.25 + (lat) * DEGRAD * 0.5);
        ra = re * sf / Math.pow(ra, sn);
        double theta = lon * DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0 * Math.PI;
        if (theta < -Math.PI) theta += 2.0 * Math.PI;
        theta *= sn;

        int nx = (int)(ra * Math.sin(theta) + XO + 0.5);
        int ny = (int)(ro - ra * Math.cos(theta) + YO + 0.5);

        return new GridCoordinate(nx, ny);
    }

    private String getSkyCondition(String code) {
        switch (code) {
            case "1": return "맑음";
            case "3": return "구름많음";
            case "4": return "흐림";
            default: return "맑음";
        }
    }

    private String getPrecipitation(String code) {
        switch (code) {
            case "0": return "없음";
            case "1": return "비";
            case "2": return "비/눈";
            case "3": return "눈";
            case "4": return "소나기";
            default: return "없음";
        }
    }

    /**
     * Mock 데이터 생성 (API 실패 시 사용)
     */
    private WeatherInfo getMockWeather() {
        WeatherInfo info = new WeatherInfo();
        info.temperature = String.valueOf(15 + random.nextInt(15));
        info.skyCondition = getRandomSkyCondition();
        info.precipitation = "없음";
        
        logger.info("Mock 날씨 데이터 반환: 기온={}°C, 하늘={}, 강수={}", 
            info.temperature, info.skyCondition, info.precipitation);
        
        return info;
    }

    private String getRandomSkyCondition() {
        String[] conditions = {"맑음", "구름많음", "흐림"};
        return conditions[random.nextInt(conditions.length)];
    }

    private static class GridCoordinate {
        int nx;
        int ny;
        
        GridCoordinate(int nx, int ny) {
            this.nx = nx;
            this.ny = ny;
        }
    }

    public static class WeatherInfo {
        public String temperature;
        public String skyCode;
        public String skyCondition;
        public String precipitationCode;
        public String precipitation;
    }
}
