# 🔧 API 문제 해결 가이드

## 403 Forbidden 오류 해결 방법

### 1. API 키 확인

공공데이터포탈에서 발급받은 **일반 인증키(Encoding)**를 사용해야 합니다.

**확인 사항:**
- [공공데이터포탈 마이페이지](https://www.data.go.kr/) > 개발계정 > 일반 인증키(Encoding) 복사
- `backend/src/main/resources/application.properties` 파일에 올바르게 설정되었는지 확인

### 2. API 신청 상태 확인

**필수 확인:**
- ✅ 에어코리아 대기오염정보 조회 서비스 신청 완료
- ✅ 기상청 단기예보 조회 서비스 신청 완료
- ✅ API 신청이 **승인**되었는지 확인 (대기 중이면 사용 불가)

### 3. API 키 테스트

백엔드 서버 실행 후 다음 URL로 테스트:

```
http://localhost:8080/api/test/air-quality
```

**응답 확인:**
- 정상: JSON 데이터 반환
- `SERVICE_KEY_IS_NOT_REGISTERED`: API 키가 등록되지 않음
- `SERVICE_KEY_IS_NOT_VALID`: API 키가 유효하지 않음
- `FORBIDDEN`: 접근 거부 (API 신청 미완료 가능성)

### 4. API 키 형식 확인

공공데이터포탈 API 키는 다음과 같은 형식입니다:
- 일반 인증키(Encoding): 긴 문자열 (예: `17c565db1c8d5ce49ddd51d20f04593f...`)
- 일반 인증키(Decoding): URL 디코딩된 형태

**중요:** Encoding 키를 사용해야 합니다!

### 5. 환경변수 설정

`application.properties`에 직접 입력하거나 환경변수로 설정:

```bash
# Windows (PowerShell)
$env:PUBLIC_DATA_API_KEY="your-api-key-here"

# Windows (CMD)
set PUBLIC_DATA_API_KEY=your-api-key-here

# Linux/Mac
export PUBLIC_DATA_API_KEY=your-api-key-here
```

### 6. API 호출 제한 확인

공공데이터포탈 API는 일일 호출 제한이 있을 수 있습니다:
- 무료 계정: 보통 1,000회/일
- 제한 초과 시 403 오류 발생 가능

### 7. 로그 확인

백엔드 로그에서 다음 정보 확인:
```
에어코리아 API 호출 URL (serviceKey 제외): ...
에어코리아 API HTTP 에러: status=403, response=...
```

로그를 통해 정확한 오류 원인을 파악할 수 있습니다.

### 8. 임시 해결책

API 키 문제가 해결될 때까지 기본값으로 동작하도록 구현되어 있습니다:
- 대기질 데이터: PM10=0, PM2.5=0 (기본값)
- 날씨 데이터: 기온=20°C, 맑음 (기본값)

## 추가 도움말

문제가 계속되면:
1. 공공데이터포탈 고객센터 문의
2. API 문서 재확인: [공공데이터포탈 API 가이드](https://www.data.go.kr/)
3. 백엔드 로그의 상세 에러 메시지 확인


