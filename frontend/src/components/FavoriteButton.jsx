import { useState, useEffect } from "react";
import { favoriteService } from "../services/favoriteService";

const FavoriteButton = ({ latitude, longitude, location }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (latitude && longitude) {
            checkFavorite();
        }
    }, [latitude, longitude]);

    const checkFavorite = async () => {
        try {
            const result = await favoriteService.checkFavorite(latitude, longitude);
            if (result.success) {
                setIsFavorite(result.isFavorite);
            }
        } catch (err) {
            console.error("찜 확인 오류:", err);
        }
    };

    const handleToggleFavorite = async () => {
        if (!latitude || !longitude || !location) {
            setError("위치 정보가 없습니다.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (isFavorite) {
                const result = await favoriteService.removeFavorite(latitude, longitude);
                if (result.success) {
                    setIsFavorite(false);
                } else {
                    setError(result.message || "찜 해제에 실패했습니다.");
                }
            } else {
                const result = await favoriteService.addFavorite(latitude, longitude, location);
                if (result.success) {
                    setIsFavorite(true);
                } else {
                    setError(result.message || "찜 추가에 실패했습니다.");
                }
            }
        } catch (err) {
            setError("서버와 연결할 수 없습니다.");
            console.error("찜 토글 오류:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!latitude || !longitude) return null;

    return (
        <div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mb-2">
                    {error}
                </div>
            )}
            <button
                onClick={handleToggleFavorite}
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                    isFavorite
                        ? "bg-pink-500 text-white hover:bg-pink-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>처리 중...</span>
                    </>
                ) : (
                    <>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`}
                            viewBox="0 0 20 20"
                            fill={isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{isFavorite ? "찜 해제" : "찜 추가"}</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default FavoriteButton;
