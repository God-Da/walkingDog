import { createContext, useContext, useState } from "react";

const MapContext = createContext(null);

export const MapProvider = ({ children }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [suitability, setSuitability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null); // 선택된 위치의 위도/경도
  const [ps, setPs] = useState(null); // Places 서비스
  const [geocoder, setGeocoder] = useState(null); // Geocoder 서비스

  return (
    <MapContext.Provider
      value={{
        map,
        setMap,
        marker,
        setMarker,
        suitability,
        setSuitability,
        loading,
        setLoading,
        error,
        setError,
        showInfoPanel,
        setShowInfoPanel,
        currentLocation,
        setCurrentLocation,
        selectedLocation,
        setSelectedLocation,
        ps,
        setPs,
        geocoder,
        setGeocoder,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within MapProvider");
  }
  return context;
};
