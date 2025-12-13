# 🔄 실제 API 연동 TODO

현재는 Mock 데이터를 반환하도록 구현되어 있습니다. 실제 공공데이터포탈 API를 연동하려면 아래 작업을 진행하세요.

## 에어코리아 API 연동

### 파일: `backend/src/main/java/com/walkingdog/backend/service/AirQualityService.java`

1. `getAirQuality` 메서드 수정
2. 실제 API 호출 로직 추가:
   ```java
   String url = "http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty";
   // 샘플 코드 방식으로 URL 생성
   // 모든 파라미터를 URLEncoder.encode로 인코딩
   ```

3. 필요한 의존성:
   - RestTemplate (이미 있음)
   - ObjectMapper (Jackson, 이미 있음)

## 기상청 API 연동

### 파일: `backend/src/main/java/com/walkingdog/backend/service/WeatherService.java`

1. `getWeather` 메서드 수정
2. 실제 API 호출 로직 추가:
   ```java
   String url = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
   // 위경도를 격자 좌표로 변환 필요
   // 모든 파라미터를 URLEncoder.encode로 인코딩
   ```

## API 키 설정

`backend/src/main/resources/application.properties`:
```properties
public.data.api.key=여기에_API_키_입력
```

## 참고사항

- 샘플 코드 방식으로 모든 파라미터를 URLEncoder.encode로 인코딩
- HTTP 사용 (https가 아닌 http)
- API 신청 상태가 "승인완료"인지 확인 필수

