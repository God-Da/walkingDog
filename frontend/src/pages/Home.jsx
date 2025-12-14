import { MapProvider } from "../context/MapContext";
import { useKakaoMap } from "../hooks/useKakaoMap";
import SearchBar from "../components/SearchBar";
import InfoPanel from "../components/InfoPanel";
import CurrentLocationButton from "../components/CurrentLocationButton";
import MapContainer from "../components/MapContainer";

const HomeContent = () => {
  useKakaoMap(); // 지도 초기화

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <MapContainer />
      <SearchBar />
      <CurrentLocationButton />
      <InfoPanel />
    </div>
  );
};

const Home = () => {
  return (
    <MapProvider>
      <HomeContent />
    </MapProvider>
  );
};

export default Home;
