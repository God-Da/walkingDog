import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { KAKAO_MAP_SCRIPT_URL, DEFAULT_POSITION } from "../constants/mapConstants";
import { useMap } from "../context/MapContext";
import { useSuitability } from "./useSuitability";

export const useKakaoMap = () => {
  const [searchParams] = useSearchParams();
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
    let geocoderService = null;
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      geocoderService = new window.kakao.maps.services.Geocoder();
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

    // URL 파라미터에서 위도/경도 확인
    const urlLat = searchParams.get("lat");
    const urlLng = searchParams.get("lng");
    
    let initialPosition = defaultPosition;
    if (urlLat && urlLng) {
      const lat = parseFloat(urlLat);
      const lng = parseFloat(urlLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        initialPosition = new window.kakao.maps.LatLng(lat, lng);
        kakaoMap.setCenter(initialPosition);
        newMarker.setPosition(initialPosition);
        // geocoder를 직접 전달하여 주소 변환 보장
        getSuitability(lat, lng, geocoderService);
        return; // URL 파라미터가 있으면 여기서 종료
      }
    }

    // 지도 클릭 이벤트 - geocoder를 직접 전달하여 주소 변환 보장
    window.kakao.maps.event.addListener(kakaoMap, "click", (mouseEvent) => {
      const latlng = mouseEvent.latLng;
      newMarker.setPosition(latlng);
      // geocoder를 직접 전달하여 지도 클릭 시에도 상세 주소가 표시되도록 함
      getSuitability(latlng.getLat(), latlng.getLng(), geocoderService);
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
          // geocoder를 직접 전달하여 주소 변환 보장
          getSuitability(lat, lng, geocoderService);
        },
        (err) => {
          console.error("위치 정보를 가져올 수 없습니다:", err);
          // geocoder를 직접 전달하여 주소 변환 보장
          getSuitability(
            defaultPosition.getLat(),
            defaultPosition.getLng(),
            geocoderService
          );
        }
      );
    } else {
      // geocoder를 직접 전달하여 주소 변환 보장
      getSuitability(
        defaultPosition.getLat(),
        defaultPosition.getLng(),
        geocoderService
      );
    }
  };

  return { map, marker };
};
