import { useState, useRef } from "react";
import { useMap } from "../context/MapContext";
import { useSuitability } from "../hooks/useSuitability";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { ps, map, marker, setShowInfoPanel } = useMap();
  const { getSuitability } = useSuitability();
  const searchInputRef = useRef(null);

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

        // 산책 적합도 조회
        getSuitability(lat, lng);
        setSearchQuery(""); // 검색어 초기화
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 존재하지 않습니다.");
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert("검색 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <div className="absolute top-5 left-4 z-30 w-96">
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
  );
};

export default SearchBar;
