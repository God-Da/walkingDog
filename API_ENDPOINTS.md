# 📡 API 엔드포인트 정보

## 에어코리아 API

### 베이스 URL
- `https://apis.data.go.kr/B552584/`

### 주요 서비스

#### 1. 대기오염정보 조회 서비스 (ArpltnInforInqireSvc)
**엔드포인트:** `/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty`

**용도:** 측정소별 실시간 대기질 정보 조회 (PM10, PM2.5 등)

**필수 파라미터:**
- `serviceKey`: API 키
- `returnType`: json 또는 xml
- `numOfRows`: 조회 개수
- `pageNo`: 페이지 번호
- `stationName`: 측정소 이름 (예: "강남구")
- `dataTerm`: 조회 기간 (DAILY, MONTH, 3MONTH)
- `ver`: 버전 (1.0)

#### 2. 대기오염경보 발령 정보 조회 서비스 (UlfptcaAlarmInqireSvc)
**엔드포인트:** `/B552584/UlfptcaAlarmInqireSvc/getUlfptcaAlarmInfo`

**용도:** 대기오염 경보 발령 정보 조회

#### 3. 측정소 정보 조회 서비스 (MsrstnInfoInqireSvc)
**엔드포인트:** `/B552584/MsrstnInfoInqireSvc/getMsrstnList`

**용도:** 측정소 목록 조회

## 기상청 API

### 베이스 URL
- `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/`

### 주요 서비스

#### 1. 초단기예보 조회
**엔드포인트:** `/getUltraSrtNcst`

**용도:** 초단기 실황 정보 조회 (기온, 하늘상태, 강수형태 등)

**필수 파라미터:**
- `serviceKey`: API 키
- `pageNo`: 페이지 번호
- `numOfRows`: 조회 개수
- `dataType`: JSON 또는 XML
- `base_date`: 발표일자 (yyyyMMdd)
- `base_time`: 발표시각 (HHmm)
- `nx`: 격자 X 좌표
- `ny`: 격자 Y 좌표

#### 2. 단기예보 조회
**엔드포인트:** `/getVilageFcst`

**용도:** 단기예보 정보 조회

## 현재 사용 중인 API

### 에어코리아
- ✅ `/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty` - 실시간 대기질 정보

### 기상청
- ✅ `/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst` - 초단기예보

## 참고사항

- 모든 API는 `https://apis.data.go.kr` 베이스 URL 사용
- `serviceKey`는 URL 인코딩 필요할 수 있음
- API 키는 동일하게 사용 가능 (하나의 키로 모든 API 사용)

