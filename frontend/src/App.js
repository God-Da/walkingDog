import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [suitability, setSuitability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  const [ps, setPs] = useState(null); // Places 서비스
  const [geocoder, setGeocoder] = useState(null); // Geocoder 서비스
  const searchInputRef = useRef(null);

  // 카카오맵 초기화
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
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=e2c95d00919ab178c18fd1c892bc7986&libraries=services&autoload=false`;
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
    const defaultPosition = new window.kakao.maps.LatLng(37.5665, 126.9780);
    
    const options = {
      center: defaultPosition,
      level: 5,
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
      setShowInfoPanel(true);
      fetchSuitability(latlng.getLat(), latlng.getLng());
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
          setShowInfoPanel(true);
          fetchSuitability(lat, lng);
        },
        (err) => {
          console.error("위치 정보를 가져올 수 없습니다:", err);
          fetchSuitability(defaultPosition.getLat(), defaultPosition.getLng());
        }
      );
    } else {
      fetchSuitability(defaultPosition.getLat(), defaultPosition.getLng());
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !ps || !map || !marker) {
      return;
    }

    // 장소 검색
    ps.keywordSearch(searchQuery, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        // 검색 결과가 있으면 첫 번째 결과로 이동
        const place = data[0];
        const lat = parseFloat(place.y);
        const lng = parseFloat(place.x);
        
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(moveLatLon);
        map.setLevel(3); // 확대
        marker.setPosition(moveLatLon);
        
        setShowInfoPanel(true);
        fetchSuitability(lat, lng);
        setSearchQuery(""); // 검색어 초기화
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 존재하지 않습니다.");
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  const moveToCurrentLocation = () => {
    if (!currentLocation || !map || !marker) {
      // 현재 위치를 다시 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const currentPos = new window.kakao.maps.LatLng(lat, lng);
            
            setCurrentLocation({ lat, lng });
            map.setCenter(currentPos);
            map.setLevel(5);
            marker.setPosition(currentPos);
            setShowInfoPanel(true);
            fetchSuitability(lat, lng);
          },
          (err) => {
            alert("현재 위치를 가져올 수 없습니다.");
          }
        );
      }
      return;
    }

    const currentPos = new window.kakao.maps.LatLng(
      currentLocation.lat,
      currentLocation.lng
    );
    map.setCenter(currentPos);
    map.setLevel(5);
    marker.setPosition(currentPos);
    setShowInfoPanel(true);
    fetchSuitability(currentLocation.lat, currentLocation.lng);
  };

  const fetchSuitability = async (lat, lng) => {
    setLoading(true);
    setError(null);
    
    try {
      // 카카오맵 역지오코딩으로 정확한 주소 가져오기
      let address = null;
      if (geocoder) {
        address = await new Promise((resolve) => {
          const callback = (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              // 가장 상세한 주소 사용
              const addr = result[0].address;
              const roadAddr = result[0].road_address;
              
              // 도로명 주소가 있으면 도로명 주소 사용, 없으면 지번 주소 사용
              if (roadAddr) {
                resolve(`${roadAddr.region_1depth_name} ${roadAddr.region_2depth_name} ${roadAddr.region_3depth_name}${roadAddr.road_name ? ' ' + roadAddr.road_name : ''}`);
              } else if (addr) {
                resolve(`${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          };
          
          geocoder.coord2Address(lng, lat, callback);
        });
      }
      
      // 주소를 백엔드로 전달
      const url = new URL('http://localhost:8080/api/walking/suitability');
      url.searchParams.append('lat', lat);
      url.searchParams.append('lon', lng);
      if (address) {
        url.searchParams.append('address', address);
      }
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "서버 오류가 발생했습니다." }));
        throw new Error(errorData.error || "데이터를 가져오는데 실패했습니다.");
      }
      
      const data = await response.json();
      setSuitability(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching suitability:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "좋음":
        return "bg-green-500";
      case "보통":
        return "bg-yellow-500";
      case "나쁨":
        return "bg-orange-500";
      case "매우나쁨":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "좋음":
        return "text-green-600";
      case "보통":
        return "text-yellow-600";
      case "나쁨":
        return "text-orange-600";
      case "매우나쁨":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "좋음":
        return "🐕";
      case "보통":
        return "🐕‍🦺";
      case "나쁨":
        return "⚠️";
      case "매우나쁨":
        return "🚫";
      default:
        return "❓";
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 헤더 - 고정 */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-indigo-600">
                🐕 산책할개
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                강아지와 함께하는 안전한 산책을 위한 날씨 및 대기질 정보
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 검색창 - 헤더 아래 */}
      <div className="absolute top-20 left-4 z-30 w-96">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="장소를 검색하세요 (예: 강남역, 한강공원)"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* 현재 위치 버튼 */}
      <button
        onClick={moveToCurrentLocation}
        className="absolute bottom-24 right-4 z-30 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg shadow-lg border border-gray-300 flex items-center gap-2 transition-all hover:shadow-xl"
        title="현재 위치로 이동"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className="font-medium">현재 위치</span>
      </button>

      {/* 지도 - 전체 화면 */}
      <div id="map" className="w-full h-full"></div>

      {/* 정보 패널 - 오버레이 */}
      {showInfoPanel && (
        <div className="absolute top-20 right-4 z-30 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto bg-white rounded-lg shadow-2xl">
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">산책 적합도</h2>
            <button
              onClick={() => setShowInfoPanel(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          <div className="p-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600 text-sm">데이터를 불러오는 중...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">
                {error}
              </div>
            )}

            {suitability && !loading && (
              <div className="space-y-4">
                {/* 상태 표시 */}
                <div
                  className={`${getStatusColor(
                    suitability.status
                  )} text-white rounded-lg p-5 text-center`}
                >
                  <div className="text-5xl mb-2">
                    {getStatusEmoji(suitability.status)}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {suitability.status}
                  </div>
                  <div className="text-sm">{suitability.message}</div>
                </div>

                {/* 상세 정보 */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">위치</span>
                    <span className="font-semibold text-gray-800">{suitability.location}</span>
                  </div>
                  {suitability.stationName && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">측정소</span>
                      <span className="font-semibold text-gray-800">{suitability.stationName}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">PM10</span>
                    <span className={`font-semibold ${getStatusTextColor(suitability.status)}`}>
                      {suitability.pm10Value} ㎍/㎥
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">PM2.5</span>
                    <span className={`font-semibold ${getStatusTextColor(suitability.status)}`}>
                      {suitability.pm25Value} ㎍/㎥
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">기온</span>
                    <span className="font-semibold text-gray-800">{suitability.temperature}°C</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">하늘 상태</span>
                    <span className="font-semibold text-gray-800">{suitability.skyCondition}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">강수</span>
                    <span className="font-semibold text-gray-800">{suitability.precipitation}</span>
                  </div>
                </div>

                {/* 기준 안내 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h3 className="font-semibold text-blue-800 mb-2 text-sm">
                    에어코리아 기준
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>좋음: PM10 0-30, PM2.5 0-15</li>
                    <li>보통: PM10 31-80, PM2.5 16-35</li>
                    <li>나쁨: PM10 81-150, PM2.5 36-75</li>
                    <li>매우나쁨: PM10 151+, PM2.5 76+</li>
                  </ul>
                </div>
              </div>
            )}

            {!suitability && !loading && !error && (
              <div className="text-center py-12 text-gray-500 text-sm">
                지도를 클릭하거나 검색하여 산책 적합도를 확인하세요
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 정보 바 */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div>
              © 2024 산책할개 - 공공데이터포탈 API 기반
            </div>
            <div>
              {suitability && (
                <span className="text-gray-500">
                  마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
