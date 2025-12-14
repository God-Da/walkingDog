import { useMap } from "../context/MapContext";
import {
    getStatusColor,
    getStatusTextColor,
    getStatusEmoji,
} from "../utils/statusUtils";
import {
    AIR_QUALITY_STANDARDS,
    STATUS_EMOJIS,
} from "../constants/statusConstants";

const InfoPanel = () => {
    const { showInfoPanel, setShowInfoPanel, loading, error, suitability } =
        useMap();

    if (!showInfoPanel) return null;

    return (
        <div className="absolute top-5 right-4 z-30 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto bg-white rounded-lg shadow-2xl">
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
                        <span className="ml-3 text-gray-600 text-sm">
                            데이터를 불러오는 중...
                        </span>
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
                            )} text-white rounded-lg p-4 text-center`}
                        >
                            {/* 범주별 이미지 */}
                            <div className="flex justify-center">
                                <div className="w-20 flex items-center justify-center mb-3">
                                    <img
                                        src={
                                            STATUS_EMOJIS[suitability.status] ||
                                            STATUS_EMOJIS.default
                                        }
                                        alt={suitability.status}
                                        className="w-full h-full object-contain scale-150"
                                    />
                                </div>
                            </div>

                            <div className="text-2xl font-bold mb-1">
                                {suitability.status}
                            </div>
                            <div className="text-sm">{suitability.message}</div>
                        </div>

                        {/* 상세 정보 */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">위치</span>
                                <span className="font-semibold text-gray-800">
                                    {suitability.location}
                                </span>
                            </div>
                            {suitability.stationName && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">
                                        측정소
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        {suitability.stationName}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">PM10</span>
                                <span
                                    className={`font-semibold ${getStatusTextColor(
                                        suitability.status
                                    )}`}
                                >
                                    {suitability.pm10Value} ㎍/㎥
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">PM2.5</span>
                                <span
                                    className={`font-semibold ${getStatusTextColor(
                                        suitability.status
                                    )}`}
                                >
                                    {suitability.pm25Value} ㎍/㎥
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">기온</span>
                                <span className="font-semibold text-gray-800">
                                    {suitability.temperature}°C
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">하늘 상태</span>
                                <span className="font-semibold text-gray-800">
                                    {suitability.skyCondition}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">강수</span>
                                <span className="font-semibold text-gray-800">
                                    {suitability.precipitation}
                                </span>
                            </div>
                        </div>

                        {/* 기준 안내 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h3 className="font-semibold text-blue-800 mb-2 text-sm">
                                에어코리아 기준
                            </h3>
                            <ul className="text-xs text-blue-700 space-y-1">
                                {AIR_QUALITY_STANDARDS.map(
                                    (standard, index) => (
                                        <li key={index}>
                                            {standard.status}: PM10{" "}
                                            {standard.pm10}, PM2.5{" "}
                                            {standard.pm25}
                                        </li>
                                    )
                                )}
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
    );
};

export default InfoPanel;
