# 🚀 산책할개 설정 가이드

## 1. 공공데이터포탈 API 키 발급

### ⚠️ 중요: 하나의 키로 모든 API 사용 가능!

공공데이터포탈에서는 **하나의 일반 인증키(Encoding)**로 모든 API를 사용할 수 있습니다.
에어코리아와 기상청 각각의 키가 아닙니다!

1. [공공데이터포탈](https://www.data.go.kr/) 접속 및 회원가입
2. 다음 API 신청 (사용할 API를 신청해야 합니다):
   - **에어코리아 대기오염정보 조회 서비스**
     - 검색: "에어코리아" 또는 "대기오염"
     - API명: `ArpltnInforInqireSvc` (대기오염정보 조회 서비스)
   - **기상청 단기예보 조회 서비스**
     - 검색: "기상청 단기예보"
     - API명: `VilageFcstInfoService_2.0`

3. **마이페이지 > 개발계정 > 일반 인증키(Encoding) 복사**
   - 이 키 하나로 에어코리아와 기상청 API 모두 사용 가능합니다!
   - 인증키 발급현황에서 복사한 키를 사용하시면 됩니다.

## 2. 카카오맵 API 키 발급

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 이름: "산책할개" (또는 원하는 이름)
4. 플랫폼 설정:
   - Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000` (개발용)
5. JavaScript 키 복사

## 3. 환경 설정

### Backend 설정

`backend/src/main/resources/application.properties` 파일 수정:

```properties
public.data.api.key=여기에_공공데이터포탈_API_키_입력
```

또는 환경변수로 설정:

```bash
export PUBLIC_DATA_API_KEY=your-api-key-here
```

### Frontend 설정

`frontend/public/index.html` 파일 수정:

```html
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=여기에_카카오맵_API_키_입력&autoload=false"></script>
```

`frontend/src/App.js` 파일에서도 동일한 키로 수정 (19번째 줄):

```javascript
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=여기에_카카오맵_API_키_입력&autoload=false`;
```

## 4. 실행 방법

### Backend 실행

```bash
cd backend
./gradlew bootRun
# 또는 Windows
gradlew.bat bootRun
```

### Frontend 실행

새 터미널에서:

```bash
cd frontend
npm install  # 처음 한 번만
npm start
```

## 5. 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. 지도가 표시되는지 확인
3. 지도를 클릭하여 산책 적합도 확인

## ⚠️ 주의사항

- 공공데이터포탈 API는 일일 호출 제한이 있을 수 있습니다
- 카카오맵 API는 도메인별로 제한됩니다 (localhost는 개발용으로 허용)
- 실제 배포 시에는 카카오맵 플랫폼에 실제 도메인을 등록해야 합니다

## 🔧 실제 API 연동 완성하기

현재는 임시 데이터를 반환하도록 구현되어 있습니다. 실제 API를 연동하려면:

1. `backend/src/main/java/com/walkingdog/backend/service/AirQualityService.java` 파일의 `getAirQuality` 메서드 수정
2. 공공데이터포탈 API 응답 형식에 맞게 파싱 로직 추가
3. 측정소 목록 API를 사용하여 실제로 가장 가까운 측정소 찾기

