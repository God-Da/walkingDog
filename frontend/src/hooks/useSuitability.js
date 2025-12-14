import { useState } from "react";
import { useMap } from "../context/MapContext";
import { fetchSuitability } from "../services/suitabilityService";

export const useSuitability = () => {
  const { setSuitability, setLoading, setError, setShowInfoPanel, setSelectedLocation, geocoder } = useMap();

  const getSuitability = async (lat, lng) => {
    setLoading(true);
    setError(null);
    setShowInfoPanel(true);
    setSelectedLocation({ lat, lng }); // 선택된 위치 저장

    try {
      const data = await fetchSuitability(lat, lng, geocoder);
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
