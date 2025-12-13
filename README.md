# 🐕 산책할개 (WalkingDog)

강아지와 함께하는 안전한 산책을 위한 날씨 및 대기질 정보 제공 웹사이트

## 📋 프로젝트 소개

공공데이터포탈의 날씨 및 미세먼지 데이터를 활용하여, 위치 기반으로 강아지의 산책 적합도를 알려주는 서비스입니다.

### 주요 기능
- 📍 카카오맵을 통한 위치 선택
- 🌤️ 실시간 날씨 정보 조회
- 💨 미세먼지(PM10, PM2.5) 농도 확인
- ✅ 에어코리아 기준에 따른 산책 적합도 판정 (좋음/보통/나쁨/매우나쁨)

## 🛠️ 기술 스택

### Backend
- Java 21
- Spring Boot 4.0.0
- Spring Web MVC
- Spring WebFlux (WebClient)

### Frontend
- React 19.2.3
- Tailwind CSS 3
- 카카오맵 API

## 📦 설치 및 실행

### 사전 준비
1. **공공데이터포탈 API 키 발급**
   - [공공데이터포탈](https://www.data.go.kr/)에서 회원가입
   - 에어코리아 대기오염정보 API 신청
   - 기상청 단기예보 API 신청

2. **카카오맵 API 키 발급**
   - [카카오 개발자 콘솔](https://developers.kakao.com/)에서 애플리케이션 등록
   - JavaScript 키 발급

### Backend 실행

```bash
cd backend

# 환경변수 설정 (또는 application.properties 수정)
export PUBLIC_DATA_API_KEY=your-public-data-api-key

# Gradle로 실행
./gradlew bootRun

# 또는 Windows
gradlew.bat bootRun
```

Backend는 `http://localhost:8080`에서 실행됩니다.

### Frontend 실행

```bash
cd frontend

# 카카오맵 API 키 설정
# public/index.html 파일에서 YOUR_KAKAO_MAP_API_KEY를 실제 키로 변경

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

Frontend는 `http://localhost:3000`에서 실행됩니다.

## 🔧 환경 설정

### Backend 설정

`backend/src/main/resources/application.properties` 파일 수정:

```properties
public.data.api.key=your-public-data-api-key-here
```

### Frontend 설정

`frontend/public/index.html` 파일에서 카카오맵 API 키 설정:

```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false"></script>
```

## 📡 API 엔드포인트

### 산책 적합도 조회
```
GET /api/walking/suitability?lat={위도}&lon={경도}
```

**응답 예시:**
```json
{
  "status": "좋음",
  "statusCode": "GOOD",
  "pm10Value": 30,
  "pm25Value": 15,
  "temperature": "20",
  "skyCondition": "맑음",
  "precipitation": "없음",
  "location": "강남구",
  "message": "산책하기 좋은 날씨입니다! 강아지와 함께 산책을 즐기세요 🐕"
}
```

## 📊 미세먼지 기준 (에어코리아)

| 등급 | PM10 (㎍/㎥) | PM2.5 (㎍/㎥) |
|------|-------------|--------------|
| 좋음 | 0-30 | 0-15 |
| 보통 | 31-80 | 16-35 |
| 나쁨 | 81-150 | 36-75 |
| 매우나쁨 | 151 이상 | 76 이상 |

## 🚀 향후 개선 사항

- [ ] 실제 공공데이터포탈 API 연동 완성
- [ ] 측정소 자동 검색 기능
- [ ] 날씨 정보 상세 조회
- [ ] 산책 추천 시간대 표시
- [ ] 히스토리 및 통계 기능
- [ ] 반응형 디자인 개선

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 👥 기여

이슈 및 개선사항은 언제든 환영합니다!


