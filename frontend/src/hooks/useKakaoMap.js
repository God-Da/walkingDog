import { useEffect } from "react";
import { KAKAO_MAP_SCRIPT_URL, DEFAULT_POSITION } from "../constants/mapConstants";
import { useMap } from "../context/MapContext";
import { useSuitability } from "./useSuitability";

export const useKakaoMap = () => {
  const {
    map,
    setMap,
    marker,
    setMarker,
    setError,
    setShowInfoPanel,
    setCurrentLocation,
    setPs,
    setGeocoder,
  } = useMap();
  
  const { getSuitability } = useSuitability();

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const container = document.getElementById("map");
    if (!container) {
      return;
    }

    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          initMap();
        });
      } else {
        setTimeout(loadKakaoMap, 100);
      }
    };

    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
      initMap();
    } else {
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = KAKAO_MAP_SCRIPT_URL;
        script.async = true;
        script.onload = () => {
          if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
            window.kakao.maps.load(() => {
              initMap();
            });
          }
        };
        script.onerror = () => {
          console.error("카카오맵 스크립트 로드 실패");
          setError("카카오맵을 불러올 수 없습니다. API 키를 확인해주세요.");
        };
        document.head.appendChild(script);
      } else {
        loadKakaoMap();
      }
    }
  }, []);

  const initMap = () => {
    const container = document.getElementById("map");
    if (!container) {
      console.error("지도 컨테이너를 찾을 수 없습니다.");
      return;
    }

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
      console.error("카카오맵이 아직 로드되지 않았습니다.");
      return;
    }

    // Places 서비스 초기화
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const placesService = new window.kakao.maps.services.Places();
      setPs(placesService);
    }

    // Geocoder 서비스 초기화 (역지오코딩용)
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoderService = new window.kakao.maps.services.Geocoder();
      setGeocoder(geocoderService);
    }

    // 기본 위치: 서울시청
    const defaultPosition = new window.kakao.maps.LatLng(
      DEFAULT_POSITION.lat,
      DEFAULT_POSITION.lng
    );

    const options = {
      center: defaultPosition,
      level: DEFAULT_POSITION.level,
    };

    const kakaoMap = new window.kakao.maps.Map(container, options);
    setMap(kakaoMap);

    // 마커 생성
    const newMarker = new window.kakao.maps.Marker({
      position: defaultPosition,
    });
    newMarker.setMap(kakaoMap);
    setMarker(newMarker);

    // 지도 클릭 이벤트
    window.kakao.maps.event.addListener(kakaoMap, "click", (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      newMarker.setPosition(latlng);
      getSuitability(latlng.getLat(), latlng.getLng());
    });

    // 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const currentPos = new window.kakao.maps.LatLng(lat, lng);

          setCurrentLocation({ lat, lng });
          kakaoMap.setCenter(currentPos);
          newMarker.setPosition(currentPos);
          getSuitability(lat, lng);
        },
        (err) => {
          console.error("위치 정보를 가져올 수 없습니다:", err);
          getSuitability(
            defaultPosition.getLat(),
            defaultPosition.getLng()
          );
        }
      );
    } else {
      getSuitability(
        defaultPosition.getLat(),
        defaultPosition.getLng()
      );
    }
  };

  return { map, marker };
};
