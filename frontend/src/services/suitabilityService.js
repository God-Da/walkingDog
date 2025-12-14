import { SUITABILITY_API_URL } from "../constants/mapConstants";

/**
 * 좌표를 주소로 변환 (카카오맵 역지오코딩)
 */
export const getAddressFromCoordinates = async (geocoder, lng, lat) => {
  if (!geocoder) return null;

  return new Promise((resolve) => {
    const callback = (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const addr = result[0].address;
        const roadAddr = result[0].road_address;

        // 도로명 주소가 있으면 도로명 주소 사용, 없으면 지번 주소 사용
        if (roadAddr) {
          resolve(
            `${roadAddr.region_1depth_name} ${roadAddr.region_2depth_name} ${roadAddr.region_3depth_name}${
              roadAddr.road_name ? " " + roadAddr.road_name : ""
            }`
          );
        } else if (addr) {
          resolve(
            `${addr.region_1depth_name} ${addr.region_2depth_name} ${addr.region_3depth_name}`
          );
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };

    geocoder.coord2Address(lng, lat, callback);
  });
};

/**
 * 산책 적합도 조회
 */
export const fetchSuitability = async (lat, lng, geocoder) => {
  let address = null;
  
  // 주소 가져오기
  if (geocoder) {
    address = await getAddressFromCoordinates(geocoder, lng, lat);
  }

  // API 호출
  const url = new URL(SUITABILITY_API_URL);
  url.searchParams.append("lat", lat);
  url.searchParams.append("lon", lng);
  if (address) {
    url.searchParams.append("address", address);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "서버 오류가 발생했습니다.",
    }));
    throw new Error(errorData.error || "데이터를 가져오는데 실패했습니다.");
  }

  return await response.json();
};
