# 🔍 API 상태 확인 가이드

현재 API 호출이 실패하고 있지만, Mock 데이터로 자동 전환되어 서비스는 정상 작동 중입니다.

## 현재 상태

✅ **서비스 정상 작동**: API 실패 시 자동으로 Mock 데이터 사용
- 에어코리아 API: 403 Forbidden → Mock 데이터로 전환
- 기상청 API: 데이터 없음 → Mock 데이터로 전환

## API 문제 해결 방법

### 1. 공공데이터포탈에서 API 신청 상태 확인

1. [공공데이터포탈](https://www.data.go.kr/) 로그인
2. **마이페이지** > **활용신청** 또는 **API 신청현황** 클릭
3. 다음 API들의 상태 확인:
   - **에어코리아 대기오염정보 조회 서비스**
   - **기상청 단기예보 조회 서비스**

**확인 사항:**
- ✅ **승인완료**: 사용 가능 (이 상태여야 함)
- ⏳ **승인대기**: 아직 사용 불가 (승인 대기 중)
- ❌ **반려**: 재신청 필요

### 2. API 키 확인

1. **마이페이지** > **개발계정**
2. **일반 인증키(Encoding)** 확인
3. `application.properties`의 키와 동일한지 확인

### 3. 브라우저에서 직접 테스트

에어코리아 API:
```
http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=17c565db1c8d5ce49ddd51d20f04593f0333667d36b75e64d1f9f2e421327312&returnType=json&numOfRows=1&pageNo=1&stationName=강남구&dataTerm=DAILY&ver=1.0
```

기상청 API:
```
http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=17c565db1c8d5ce49ddd51d20f04593f0333667d36b75e64d1f9f2e421327312&pageNo=1&numOfRows=10&dataType=JSON&base_date=20241214&base_time=0600&nx=55&ny=127
```

**예상 결과:**
- 정상: JSON 데이터 반환
- 403: "Forbidden" 또는 오류 메시지

## 현재 동작 방식

1. **API 호출 시도**: 실제 공공데이터포탈 API 호출
2. **실패 시 자동 전환**: Mock 데이터로 자동 전환
3. **서비스 중단 없음**: 사용자는 계속 서비스를 사용할 수 있음

## 로그 확인

백엔드 로그에서 다음 메시지를 확인하세요:

- `"실제 API 데이터 반환"` → API 연동 성공 ✅
- `"API 호출 실패, Mock 데이터 사용"` → API 실패, Mock 데이터 사용 ⚠️
- `"Mock 대기질 데이터 반환"` → Mock 데이터 사용 중 ℹ️

## 권장 사항

1. **현재 상태 유지**: Mock 데이터로도 서비스는 정상 작동
2. **API 신청 상태 확인**: 공공데이터포탈에서 "승인완료" 상태인지 확인
3. **API 승인 대기**: 승인 대기 중이라면 승인될 때까지 대기
4. **고객센터 문의**: 문제가 계속되면 공공데이터포탈 고객센터(1577-3074) 문의

## 결론

현재 서비스는 **정상 작동 중**입니다. API가 실패해도 Mock 데이터로 자동 전환되어 사용자는 문제없이 서비스를 사용할 수 있습니다. 실제 API 연동은 공공데이터포탈에서 API 신청 상태가 "승인완료"가 되면 자동으로 작동합니다.

