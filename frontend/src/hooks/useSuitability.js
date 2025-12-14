import { useState } from "react";
import { useMap } from "../context/MapContext";
import { fetchSuitability } from "../services/suitabilityService";

export const useSuitability = () => {
  const { setSuitability, setLoading, setError, setShowInfoPanel, setSelectedLocation, geocoder } = useMap();

  const getSuitability = async (lat, lng, customGeocoder = null) => {
    setLoading(true);
    setError(null);
    setShowInfoPanel(true);
    setSelectedLocation({ lat, lng }); // 선택된 위치 저장

    // customGeocoder가 제공되면 사용하고, 없으면 Context의 geocoder 사용
    const geocoderToUse = customGeocoder || geocoder;

    try {
      const data = await fetchSuitability(lat, lng, geocoderToUse);
      setSuitability(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching suitability:", err);
    } finally {
      setLoading(false);
    }
  };

  return { getSuitability };
};
