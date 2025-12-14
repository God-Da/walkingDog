import { useMap } from "../context/MapContext";
import { useSuitability } from "../hooks/useSuitability";

const CurrentLocationButton = () => {
  const { currentLocation, map, marker, setCurrentLocation } = useMap();
  const { getSuitability } = useSuitability();

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
            getSuitability(lat, lng);
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
    getSuitability(currentLocation.lat, currentLocation.lng);
  };

  return (
    <button
      onClick={moveToCurrentLocation}
      className="absolute bottom-20 right-4 z-30 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg shadow-lg border border-gray-300 flex items-center gap-2 transition-all hover:shadow-xl"
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
  );
};

export default CurrentLocationButton;
