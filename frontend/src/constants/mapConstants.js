// 지도 관련 상수
export const KAKAO_MAP_API_KEY = "e2c95d00919ab178c18fd1c892bc7986";
export const KAKAO_MAP_SCRIPT_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;

// 기본 위치 (서울시청)
export const DEFAULT_POSITION = {
  lat: 37.5665,
  lng: 126.978,
  level: 5,
};

// API 엔드포인트
export const API_BASE_URL = "http://localhost:8080";
export const SUITABILITY_API_URL = `${API_BASE_URL}/api/walking/suitability`;
