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

import java.util.ArrayList;
import java.util.List;

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
        return getAirQualityByLocation(lat, lon, null);
    }

    /**
     * 위경도 기준 대기질 조회 (에어코리아 시도별 실시간)
     * @param address 카카오맵 역지오코딩으로 얻은 주소 (선택사항)
     */
    public AirQualityResponse getAirQualityByLocation(double lat, double lon, String address) {

        logger.info("대기질 정보 조회: lat={}, lon={}, address={}", lat, lon, address);

        try {
            // 1️⃣ 위경도 → 시도명
            String sidoName = resolveSido(lat, lon);
            
            // 2️⃣ 사용자 위치 주소 생성 (카카오맵 주소가 있으면 사용, 없으면 시도명 + 좌표)
            String userLocation = address != null && !address.isEmpty() 
                    ? address 
                    : formatLocation(sidoName, lat, lon);

            // 3️⃣ 시도별 측정소 실시간 데이터 조회
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

            // 4️⃣ API 호출
            String response = restTemplate.getForObject(url, String.class);

            JsonNode items = objectMapper.readTree(response)
                    .path("response")
                    .path("body")
                    .path("items");

            if (!items.isArray() || items.isEmpty()) {
                logger.warn("대기질 API 응답에 데이터 없음");
                return getMockAirQuality(lat, lon);
            }

            // 5️⃣ 측정소 정보 API로 좌표 가져오기
            List<StationInfo> stations = getStationInfoList(sidoName);
            logger.info("측정소 정보 조회: {}개 측정소 발견, 실시간 데이터 {}개", stations.size(), items.size());
            
            // 6️⃣ 가장 가까운 측정소 찾기
            JsonNode nearestItem;
            if (stations.isEmpty()) {
                // 측정소 정보를 가져오지 못한 경우, 측정소 이름 기반으로 추정
                logger.warn("측정소 정보를 가져오지 못함. 측정소 이름 기반으로 추정");
                nearestItem = findNearestStationByName(items, lat, lon);
            } else {
                nearestItem = findNearestStation(items, stations, lat, lon);
                logger.info("선택된 측정소: {}", nearestItem.path("stationName").asText());
            }

            AirQualityResponse result = new AirQualityResponse();
            result.setPm10Value(parseValue(nearestItem.path("pm10Value").asText()));
            result.setPm25Value(parseValue(nearestItem.path("pm25Value").asText()));
            result.setLocation(userLocation);
            result.setStationName(nearestItem.path("stationName").asText());
            result.setKhaiGrade(nearestItem.path("khaiGrade").asText());
            result.setDataTime(nearestItem.path("dataTime").asText());

            logger.info(
                    "대기질 실데이터 반환: PM10={}, PM2.5={}, 위치={}, 측정소={}",
                    result.getPm10Value(),
                    result.getPm25Value(),
                    result.getLocation(),
                    result.getStationName()
            );

            return result;

        } catch (Exception e) {
            // ❗ 외부 API 실패는 예외가 아니라 '상황'
            logger.warn("대기질 API 실패 → Mock 데이터 사용", e);
            return getMockAirQuality(lat, lon);
        }
    }

    /**
     * 위경도 → 시도명 (정확한 매핑)
     */
    private String resolveSido(double lat, double lon) {
        // 서울: 37.4 ~ 37.7, 126.7 ~ 127.2
        if (lat >= 37.4 && lat <= 37.7 && lon >= 126.7 && lon <= 127.2) {
            return "서울";
        }
        
        // 인천: 37.3 ~ 37.6, 126.4 ~ 126.8
        if (lat >= 37.3 && lat <= 37.6 && lon >= 126.4 && lon <= 126.8) {
            return "인천";
        }
        
        // 경기: 37.0 ~ 38.6, 126.5 ~ 128.0 (서울/인천 제외, 성남/용인 등 포함)
        if (lat >= 37.0 && lat <= 38.6 && lon >= 126.5 && lon <= 128.0) {
            if (!(lat >= 37.4 && lat <= 37.7 && lon >= 126.7 && lon <= 127.2)) { // 서울 제외
                if (!(lat >= 37.3 && lat <= 37.6 && lon >= 126.4 && lon <= 126.8)) { // 인천 제외
                    return "경기";
                }
            }
        }
        
        // 강원: 37.0 ~ 38.6, 127.5 ~ 129.0 (경기와 겹치지 않도록 조정)
        if (lat >= 37.0 && lat <= 38.6 && lon >= 127.5 && lon <= 129.0) {
            return "강원";
        }
        
        // 충북: 36.0 ~ 37.5, 127.0 ~ 128.5
        if (lat >= 36.0 && lat <= 37.5 && lon >= 127.0 && lon <= 128.5) {
            return "충북";
        }
        
        // 충남: 35.8 ~ 37.0, 125.8 ~ 127.5
        if (lat >= 35.8 && lat <= 37.0 && lon >= 125.8 && lon <= 127.5) {
            return "충남";
        }
        
        // 세종: 36.4 ~ 36.7, 127.1 ~ 127.4
        if (lat >= 36.4 && lat <= 36.7 && lon >= 127.1 && lon <= 127.4) {
            return "세종";
        }
        
        // 대전: 36.2 ~ 36.5, 127.2 ~ 127.6
        if (lat >= 36.2 && lat <= 36.5 && lon >= 127.2 && lon <= 127.6) {
            return "대전";
        }
        
        // 전북: 35.3 ~ 36.2, 126.0 ~ 127.8
        if (lat >= 35.3 && lat <= 36.2 && lon >= 126.0 && lon <= 127.8) {
            return "전북";
        }
        
        // 전남: 34.0 ~ 35.5, 125.0 ~ 127.5
        if (lat >= 34.0 && lat <= 35.5 && lon >= 125.0 && lon <= 127.5) {
            return "전남";
        }
        
        // 광주: 35.0 ~ 35.3, 126.6 ~ 126.9
        if (lat >= 35.0 && lat <= 35.3 && lon >= 126.6 && lon <= 126.9) {
            return "광주";
        }
        
        // 경북: 35.4 ~ 37.5, 128.0 ~ 130.0
        if (lat >= 35.4 && lat <= 37.5 && lon >= 128.0 && lon <= 130.0) {
            return "경북";
        }
        
        // 대구: 35.7 ~ 36.0, 128.4 ~ 128.7
        if (lat >= 35.7 && lat <= 36.0 && lon >= 128.4 && lon <= 128.7) {
            return "대구";
        }
        
        // 경남: 34.5 ~ 36.0, 127.5 ~ 129.5
        if (lat >= 34.5 && lat <= 36.0 && lon >= 127.5 && lon <= 129.5) {
            return "경남";
        }
        
        // 부산: 35.0 ~ 35.3, 128.9 ~ 129.3
        if (lat >= 35.0 && lat <= 35.3 && lon >= 128.9 && lon <= 129.3) {
            return "부산";
        }
        
        // 울산: 35.3 ~ 35.7, 129.1 ~ 129.5
        if (lat >= 35.3 && lat <= 35.7 && lon >= 129.1 && lon <= 129.5) {
            return "울산";
        }
        
        // 제주: 33.0 ~ 34.0, 126.0 ~ 127.0
        if (lat >= 33.0 && lat <= 34.0 && lon >= 126.0 && lon <= 127.0) {
            return "제주";
        }
        
        // 기본값: 위도 기반으로 추정
        if (lat >= 37.5) return "경기";
        if (lat >= 36.0) return "충북";
        if (lat >= 35.0) return "전북";
        return "전남";
    }
    
    /**
     * 위치 주소 포맷팅
     */
    private String formatLocation(String sidoName, double lat, double lon) {
        // 간단하게 시도명 + 위경도로 표시 (나중에 역지오코딩으로 개선 가능)
        return String.format("%s (%.4f, %.4f)", sidoName, lat, lon);
    }
    
    /**
     * 측정소 정보 조회 (좌표 포함)
     */
    private List<StationInfo> getStationInfoList(String sidoName) {
        List<StationInfo> stations = new ArrayList<>();
        
        try {
            String url = UriComponentsBuilder
                    .fromUriString("http://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getMsrstnList")
                    .queryParam("serviceKey", apiKey)
                    .queryParam("returnType", "json")
                    .queryParam("numOfRows", 100)
                    .queryParam("pageNo", 1)
                    .queryParam("addr", sidoName)
                    .queryParam("stationName", "")
                    .build(false)
                    .toUriString();
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode body = root.path("response").path("body");
            JsonNode items = body.path("items");
            
            // items가 배열이 아닌 경우 item 필드 확인
            if (!items.isArray() && items.has("item")) {
                items = items.path("item");
            }
            
            logger.info("측정소 정보 API 응답: items 타입={}, 배열 여부={}, null 여부={}", 
                    items.getNodeType(), items.isArray(), items.isNull());
            
            // 응답 구조 디버깅 - 첫 번째 항목의 모든 필드 확인
            if (items.isArray() && items.size() > 0) {
                JsonNode firstItem = items.get(0);
                logger.info("측정소 정보 API 첫 번째 항목 필드: {}", firstItem.fieldNames().toString());
                logger.info("측정소 정보 API 첫 번째 항목 전체: {}", firstItem.toString());
            }
            
            if (items.isArray()) {
                for (JsonNode item : items) {
                    String name = item.path("stationName").asText("");
                    String addr = item.path("addr").asText("");
                    
                    // 측정소 정보 API에서 WGS84 좌표 가져오기
                    // 에어코리아 API의 dmX, dmY는 실제로 WGS84 좌표입니다 (dmX=위도, dmY=경도)
                    double lat = 0;
                    double lon = 0;
                    
                    // dmX, dmY 우선 사용 (WGS84 좌표: dmX=위도, dmY=경도)
                    if (item.has("dmX")) {
                        String dmXStr = item.path("dmX").asText("");
                        if (!dmXStr.isEmpty() && !dmXStr.equals("0")) {
                            lat = parseDouble(dmXStr);
                        }
                    }
                    if (item.has("dmY")) {
                        String dmYStr = item.path("dmY").asText("");
                        if (!dmYStr.isEmpty() && !dmYStr.equals("0")) {
                            lon = parseDouble(dmYStr);
                        }
                    }
                    
                    // dmX, dmY가 없으면 tmX, tmY 시도 (혹시 TM 좌표일 수도 있음)
                    if (lat == 0 && item.has("tmX")) {
                        String tmXStr = item.path("tmX").asText("");
                        if (!tmXStr.isEmpty() && !tmXStr.equals("0")) {
                            // tmX가 위도 범위인지 확인 (33~43)
                            double tmXValue = parseDouble(tmXStr);
                            if (tmXValue > 33 && tmXValue < 43) {
                                lat = tmXValue;
                            }
                        }
                    }
                    if (lon == 0 && item.has("tmY")) {
                        String tmYStr = item.path("tmY").asText("");
                        if (!tmYStr.isEmpty() && !tmYStr.equals("0")) {
                            // tmY가 경도 범위인지 확인 (124~132)
                            double tmYValue = parseDouble(tmYStr);
                            if (tmYValue > 124 && tmYValue < 132) {
                                lon = tmYValue;
                            }
                        }
                    }
                    
                    // 디버깅: 측정소 정보 확인
                    if (name.equals("중구") || name.equals("송파구") || name.contains("성남") || name.contains("삼전") || name.contains("문정")) {
                        logger.info("측정소 {}: dmX={}, dmY={}, WGS84(lat={}, lon={}), addr={}", 
                                name, item.path("dmX").asText(""), item.path("dmY").asText(""), 
                                lat, lon, addr);
                    }
                    
                    // 좌표가 없으면 주소 기반으로 좌표 추정 (최후의 수단)
                    if (lat == 0 || lon == 0) {
                        if (!addr.isEmpty()) {
                            logger.warn("측정소 {} 좌표 없음, 주소 기반 추정: {}", name, addr);
                            // 주소에서 WGS84 좌표 추정
                            double[] coords = estimateCoordinatesFromAddress(addr, name);
                            lat = coords[1];  // 위도
                            lon = coords[0];  // 경도
                            logger.info("측정소 {} 주소 기반 좌표 추정: WGS84(lat={}, lon={})", 
                                    name, lat, lon);
                        }
                    }
                    
                    // WGS84 좌표가 있으면 저장
                    if (lat != 0 && lon != 0) {
                        stations.add(new StationInfo(name, addr, lat, lon));
                        if (name.equals("중구") || name.equals("송파구") || name.contains("삼전") || name.contains("문정") || name.contains("강동")) {
                            logger.info("측정소 정보 저장: {} - WGS84(lat={}, lon={}), addr={}", name, lat, lon, addr);
                        }
                    } else {
                        logger.warn("측정소 {} 좌표 없음, 제외됨", name);
                    }
                }
            }
        } catch (Exception e) {
            logger.warn("측정소 정보 API 호출 실패: {}", e.getMessage(), e);
        }
        
        return stations;
    }
    
    /**
     * 주소와 측정소 이름에서 좌표 추정 (더 정확한 매핑)
     */
    private double[] estimateCoordinatesFromAddress(String addr, String stationName) {
        // 측정소 이름 기반 좌표 (정확한 이름 매칭 우선)
        // 정확한 이름 매칭
        if (stationName.equals("송파구") || stationName.equals("송파")) {
            // 주소에서 더 정확한 위치 확인
            if (addr.contains("삼전") || addr.contains("삼전동")) {
                return new double[]{127.1058, 37.5145}; // 삼전동
            }
            if (addr.contains("문정") || addr.contains("문정동")) {
                return new double[]{127.1250, 37.4780}; // 문정동
            }
            return new double[]{127.1058, 37.5145}; // 송파구 중심
        }
        if (stationName.contains("삼전")) {
            return new double[]{127.1058, 37.5145}; // 삼전동
        }
        if (stationName.contains("문정")) {
            return new double[]{127.1250, 37.4780}; // 문정동
        }
        if (stationName.equals("강남구") || stationName.equals("강남")) {
            return new double[]{127.0473, 37.5172};
        }
        if (stationName.equals("서초구") || stationName.equals("서초")) {
            return new double[]{127.0324, 37.4837};
        }
        if (stationName.equals("강동구") || stationName.equals("강동")) {
            return new double[]{127.1238, 37.5301};
        }
        if (stationName.equals("중구")) {
            return new double[]{126.9978, 37.5636};
        }
        if (stationName.contains("성남")) {
            return new double[]{127.1290, 37.4201};
        }
        
        // 주소 기반 좌표
        // 서울 구별 좌표
        if (addr.contains("송파구") || addr.contains("송파")) {
            if (addr.contains("문정") || addr.contains("삼전")) {
                return new double[]{127.1250, 37.4780}; // 문정동/삼전동
            }
            return new double[]{127.1058, 37.5145}; // 송파구 중심
        }
        if (addr.contains("중구")) return new double[]{126.9978, 37.5636};
        if (addr.contains("종로구")) return new double[]{126.9978, 37.5730};
        if (addr.contains("용산구")) return new double[]{126.9780, 37.5326};
        if (addr.contains("성동구")) return new double[]{127.0366, 37.5633};
        if (addr.contains("광진구")) return new double[]{127.0845, 37.5384};
        if (addr.contains("동대문구")) return new double[]{127.0496, 37.5744};
        if (addr.contains("중랑구")) return new double[]{127.0928, 37.6060};
        if (addr.contains("성북구")) return new double[]{127.0167, 37.5894};
        if (addr.contains("강북구")) return new double[]{127.0257, 37.6398};
        if (addr.contains("도봉구")) return new double[]{127.0458, 37.6688};
        if (addr.contains("노원구")) return new double[]{127.0564, 37.6542};
        if (addr.contains("은평구")) return new double[]{126.9300, 37.6027};
        if (addr.contains("서대문구")) return new double[]{126.9368, 37.5791};
        if (addr.contains("마포구")) return new double[]{126.9080, 37.5663};
        if (addr.contains("양천구")) return new double[]{126.8669, 37.5170};
        if (addr.contains("강서구")) return new double[]{126.8495, 37.5509};
        if (addr.contains("구로구")) return new double[]{126.8874, 37.4954};
        if (addr.contains("금천구")) return new double[]{126.9027, 37.4519};
        if (addr.contains("영등포구")) return new double[]{126.9073, 37.5264};
        if (addr.contains("동작구")) return new double[]{126.9779, 37.5124};
        if (addr.contains("관악구")) return new double[]{126.9515, 37.4784};
        if (addr.contains("서초구")) return new double[]{127.0324, 37.4837};
        if (addr.contains("강남구")) return new double[]{127.0473, 37.5172};
        if (addr.contains("강동구")) return new double[]{127.1238, 37.5301};
        
        // 시도별 좌표
        if (addr.contains("서울")) return new double[]{126.9780, 37.5665};
        if (addr.contains("부산")) return new double[]{129.0756, 35.1796};
        if (addr.contains("대구")) return new double[]{128.5910, 35.8714};
        if (addr.contains("인천")) return new double[]{126.7052, 37.4563};
        if (addr.contains("광주")) return new double[]{126.8530, 35.1595};
        if (addr.contains("대전")) return new double[]{127.3845, 36.3504};
        if (addr.contains("울산")) return new double[]{129.3114, 35.5384};
        if (addr.contains("세종")) return new double[]{127.2890, 36.4800};
        if (addr.contains("성남")) return new double[]{127.1290, 37.4201};
        if (addr.contains("수원")) return new double[]{127.0286, 37.2636};
        if (addr.contains("용인")) return new double[]{127.2053, 37.2411};
        if (addr.contains("안양")) return new double[]{126.9568, 37.3943};
        if (addr.contains("부천")) return new double[]{126.7660, 37.5047};
        if (addr.contains("안산")) return new double[]{126.8313, 37.3219};
        if (addr.contains("고양")) return new double[]{126.8326, 37.6584};
        if (addr.contains("의정부")) return new double[]{127.0469, 37.7381};
        if (addr.contains("경기")) return new double[]{127.4167, 37.4167};
        if (addr.contains("강원")) return new double[]{128.1555, 37.8228};
        if (addr.contains("충북")) return new double[]{127.4913, 36.8000};
        if (addr.contains("충남")) return new double[]{126.8450, 36.5184};
        if (addr.contains("전북")) return new double[]{127.1482, 35.7175};
        if (addr.contains("전남")) return new double[]{126.4510, 34.8679};
        if (addr.contains("경북")) return new double[]{128.8889, 36.4919};
        if (addr.contains("경남")) return new double[]{128.6910, 35.4606};
        if (addr.contains("제주")) return new double[]{126.5312, 33.4996};
        return new double[]{126.9780, 37.5665}; // 기본값: 서울
    }
    
    /**
     * 측정소 이름 기반으로 가장 가까운 측정소 찾기 (측정소 정보 API 실패 시)
     */
    private JsonNode findNearestStationByName(JsonNode items, double userLat, double userLon) {
        JsonNode nearestItem = items.get(0);
        double minDistance = Double.MAX_VALUE;
        
        // 측정소 이름에서 지역 정보 추출하여 대략적인 거리 계산
        for (JsonNode item : items) {
            String stationName = item.path("stationName").asText("");
            double[] coords = estimateCoordinatesFromStationName(stationName, userLat, userLon);
            
            if (coords != null) {
                double distance = calculateDistance(userLat, userLon, coords[1], coords[0]);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestItem = item;
                }
            }
        }
        
        logger.debug("측정소 이름 기반 가장 가까운 측정소: {}, 거리: {}km", 
                nearestItem.path("stationName").asText(), 
                minDistance < Double.MAX_VALUE ? String.format("%.2f", minDistance) : "알 수 없음");
        
        return nearestItem;
    }
    
    /**
     * 측정소 이름에서 좌표 추정
     */
    private double[] estimateCoordinatesFromStationName(String stationName, double userLat, double userLon) {
        // 측정소 이름에 지역 정보가 포함되어 있는 경우 추정
        // 예: "강남구", "신풍동" 등
        // 사용자 위치와 비슷한 지역의 측정소를 우선 선택
        // 여기서는 간단하게 사용자 위치 근처의 좌표를 반환
        // (실제로는 측정소 이름 데이터베이스가 필요)
        
        // 사용자 위치와 비슷한 좌표 반환 (약간의 오차 허용)
        return new double[]{userLon, userLat};
    }
    
    /**
     * 가장 가까운 측정소 찾기
     * 사용자 위치와 측정소 모두 WGS84 좌표이므로 Haversine 공식으로 거리 계산
     */
    private JsonNode findNearestStation(JsonNode items, List<StationInfo> stations, double userLat, double userLon) {
        JsonNode nearestItem = items.get(0);
        double minDistance = Double.MAX_VALUE;
        int matchedCount = 0;
        int validCount = 0;
        
        // 거리와 측정소 정보를 저장할 리스트
        List<StationDistance> stationDistances = new ArrayList<>();
        
        logger.info("가장 가까운 측정소 찾기 시작: 사용자 위치 WGS84(lat={}, lon={}), 측정소 정보 {}개", userLat, userLon, stations.size());
        
        for (JsonNode item : items) {
            String stationName = item.path("stationName").asText("");
            
            // 측정소 정보에서 WGS84 좌표 찾기
            StationInfo stationInfo = stations.stream()
                    .filter(s -> s.name.equals(stationName))
                    .findFirst()
                    .orElse(null);
            
            if (stationInfo == null) {
                logger.debug("측정소 정보 없음: {}", stationName);
                continue;
            }
            
            matchedCount++;
            
            // WGS84 좌표가 없으면 스킵
            if (stationInfo.lat == 0 || stationInfo.lon == 0) {
                logger.debug("측정소 {} WGS84 좌표 없음: lat={}, lon={}", stationName, stationInfo.lat, stationInfo.lon);
                continue;
            }
            
            // Haversine 공식으로 거리 계산 (킬로미터)
            double distanceKm = calculateDistance(userLat, userLon, stationInfo.lat, stationInfo.lon);
            
            // 거리가 비정상적으로 크면 스킵 (좌표 문제 가능성)
            if (distanceKm > 500) { // 500km 이상이면 비정상
                logger.warn("측정소 {} 거리 비정상: {}km, 좌표 확인 필요", 
                        stationName, String.format("%.2f", distanceKm));
                continue;
            }
            
            validCount++;
            stationDistances.add(new StationDistance(stationName, item, distanceKm, stationInfo.lat, stationInfo.lon));
            
            if (stationName.equals("중구") || stationName.equals("송파구") || stationName.contains("삼전") || 
                stationName.contains("문정") || stationName.contains("강동")) {
                logger.info("측정소 {}: WGS84(lat={}, lon={}), 거리={}km", 
                        stationName, String.format("%.6f", stationInfo.lat), String.format("%.6f", stationInfo.lon), 
                        String.format("%.2f", distanceKm));
            }
            
            if (distanceKm < minDistance) {
                minDistance = distanceKm;
                nearestItem = item;
            }
        }
        
        // 상위 5개 측정소 거리 로그 출력
        stationDistances.sort((a, b) -> Double.compare(a.distance, b.distance));
        logger.info("가장 가까운 측정소 TOP 5:");
        for (int i = 0; i < Math.min(5, stationDistances.size()); i++) {
            StationDistance sd = stationDistances.get(i);
            logger.info("  {}. {} - 거리: {}km (WGS84: lat={}, lon={})", 
                    i + 1, sd.stationName, String.format("%.2f", sd.distance), 
                    String.format("%.6f", sd.lat), String.format("%.6f", sd.lon));
        }
        
        logger.info("측정소 매칭 결과: 매칭={}, 유효 좌표={}, 최종 선택={}, 거리={}km", 
                matchedCount, validCount, nearestItem.path("stationName").asText(),
                minDistance < Double.MAX_VALUE ? String.format("%.2f", minDistance) : "알 수 없음");
        
        // 유효한 좌표가 하나도 없는 경우 첫 번째 항목 반환
        if (validCount == 0) {
            logger.warn("유효한 좌표가 없어 첫 번째 측정소 반환: {}", nearestItem.path("stationName").asText());
        }
        
        return nearestItem;
    }
    
    /**
     * 측정소와 거리 정보를 저장하는 클래스
     */
    private static class StationDistance {
        String stationName;
        JsonNode item;
        double distance;  // 킬로미터 단위
        double lat;       // WGS84 위도
        double lon;       // WGS84 경도
        
        StationDistance(String stationName, JsonNode item, double distance, double lat, double lon) {
            this.stationName = stationName;
            this.item = item;
            this.distance = distance;
            this.lat = lat;
            this.lon = lon;
        }
    }
    
    /**
     * 두 지점 간 거리 계산 (Haversine 공식)
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 지구 반경 (km)
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    /**
     * 문자열을 double로 파싱
     */
    private double parseDouble(String value) {
        try {
            if (value == null || value.isBlank() || "-".equals(value)) {
                return 0.0;
            }
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
    
    /**
     * 측정소 정보 저장 클래스
     * WGS84 좌표 저장 (에어코리아 API의 dmX=위도, dmY=경도)
     */
    private static class StationInfo {
        String name;
        String addr;
        double lat;  // WGS84 위도 (dmX)
        double lon;  // WGS84 경도 (dmY)
        
        StationInfo(String name, String addr, double lat, double lon) {
            this.name = name;
            this.addr = addr;
            this.lat = lat;
            this.lon = lon;
        }
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
    private AirQualityResponse getMockAirQuality(double lat, double lon) {
        AirQualityResponse mock = new AirQualityResponse();
        mock.setPm10Value(30);
        mock.setPm25Value(18);
        mock.setLocation(formatLocation(resolveSido(lat, lon), lat, lon));
        mock.setStationName("MockStation");
        mock.setKhaiGrade("2");
        mock.setDataTime("MockTime");

        logger.info("Mock 대기질 데이터 반환");
        return mock;
    }
}
