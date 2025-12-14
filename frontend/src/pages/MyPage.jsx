import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { favoriteService } from "../services/favoriteService";
import { reviewService } from "../services/reviewService";
import { userService } from "../services/userService";
import { getAddressFromCoordinates } from "../services/suitabilityService";

const MyPage = () => {
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile"); // "profile", "favorites", "reviews"
    const navigate = useNavigate();

    // 회원정보 수정 관련 상태
    const [editEmail, setEditEmail] = useState("");
    const [editName, setEditName] = useState("");
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    // 비밀번호 변경 관련 상태
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/auth/me", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    setEditEmail(data.user.email);
                    setEditName(data.user.name);
                    loadFavorites();
                    loadReviews();
                } else {
                    navigate("/login");
                }
            } else {
                navigate("/login");
            }
        } catch (err) {
            console.error("인증 확인 오류:", err);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    // 카카오맵 스크립트 로드 대기
    const waitForKakaoMap = () => {
        return new Promise((resolve) => {
            if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                // 최대 5초 대기
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 5000);
            }
        });
    };

    const loadFavorites = async () => {
        try {
            const result = await favoriteService.getMyFavorites();
            if (result.success) {
                const favoritesList = result.favorites || [];
                
                // 카카오맵 스크립트 로드 대기
                await waitForKakaoMap();
                
                // 각 찜 항목의 좌표를 역지오코딩하여 상세 주소 가져오기
                const favoritesWithAddresses = await Promise.all(
                    favoritesList.map(async (favorite) => {
                        // 좌표 형식인지 확인 (괄호와 숫자 패턴이 있는 경우)
                        const isCoordinateFormat = favorite.location && 
                            /\([\d.]+,\s*[\d.]+\)/.test(favorite.location);
                        
                        if (!isCoordinateFormat) {
                            return favorite; // 이미 상세 주소인 경우 그대로 반환
                        }
                        
                        // geocoder 생성
                        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                            const geocoder = new window.kakao.maps.services.Geocoder();
                            const address = await getAddressFromCoordinates(
                                geocoder,
                                favorite.longitude,
                                favorite.latitude
                            );
                            return {
                                ...favorite,
                                location: address || favorite.location, // 주소를 가져오지 못한 경우 기존 값 유지
                            };
                        }
                        return favorite;
                    })
                );
                setFavorites(favoritesWithAddresses);
            }
        } catch (err) {
            console.error("찜 목록 로드 오류:", err);
        }
    };

    const loadReviews = async () => {
        try {
            const result = await reviewService.getMyReviews();
            if (result.success) {
                const reviewsList = result.reviews || [];
                
                // 카카오맵 스크립트 로드 대기
                await waitForKakaoMap();
                
                // 각 리뷰 항목의 좌표를 역지오코딩하여 상세 주소 가져오기
                const reviewsWithAddresses = await Promise.all(
                    reviewsList.map(async (review) => {
                        // 좌표 형식인지 확인 (괄호와 숫자 패턴이 있는 경우)
                        const isCoordinateFormat = review.location && 
                            /\([\d.]+,\s*[\d.]+\)/.test(review.location);
                        
                        if (!isCoordinateFormat) {
                            return review; // 이미 상세 주소인 경우 그대로 반환
                        }
                        
                        // geocoder 생성
                        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
                            const geocoder = new window.kakao.maps.services.Geocoder();
                            const address = await getAddressFromCoordinates(
                                geocoder,
                                review.longitude,
                                review.latitude
                            );
                            return {
                                ...review,
                                location: address || review.location, // 주소를 가져오지 못한 경우 기존 값 유지
                            };
                        }
                        return review;
                    })
                );
                setReviews(reviewsWithAddresses);
            }
        } catch (err) {
            console.error("리뷰 목록 로드 오류:", err);
        }
    };

    const handleRemoveFavorite = async (latitude, longitude) => {
        if (!window.confirm("찜 목록에서 제거하시겠습니까?")) {
            return;
        }

        try {
            const result = await favoriteService.removeFavorite(latitude, longitude);
            if (result.success) {
                loadFavorites();
            } else {
                alert(result.message || "찜 해제에 실패했습니다.");
            }
        } catch (err) {
            alert("서버와 연결할 수 없습니다.");
            console.error("찜 해제 오류:", err);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("리뷰를 삭제하시겠습니까?")) {
            return;
        }

        try {
            const result = await reviewService.deleteReview(reviewId);
            if (result.success) {
                loadReviews();
            } else {
                alert(result.message || "리뷰 삭제에 실패했습니다.");
            }
        } catch (err) {
            alert("서버와 연결할 수 없습니다.");
            console.error("리뷰 삭제 오류:", err);
        }
    };

    const handleLocationClick = (latitude, longitude) => {
        navigate(`/?lat=${latitude}&lng=${longitude}`);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");

        if (!editEmail || !editName) {
            setProfileError("이메일과 이름을 모두 입력해주세요.");
            return;
        }

        try {
            const result = await userService.updateProfile(editEmail, editName);
            if (result.success) {
                setUser(result.user);
                setProfileSuccess("회원정보가 수정되었습니다.");
                setEditingProfile(false);
                // 헤더 업데이트를 위해 페이지 새로고침
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setProfileError(result.message || "회원정보 수정에 실패했습니다.");
            }
        } catch (err) {
            setProfileError("서버와 연결할 수 없습니다.");
            console.error("회원정보 수정 오류:", err);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("모든 필드를 입력해주세요.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        if (newPassword.length < 4) {
            setPasswordError("비밀번호는 최소 4자 이상이어야 합니다.");
            return;
        }

        setChangingPassword(true);
        try {
            const result = await userService.changePassword(currentPassword, newPassword);
            if (result.success) {
                setPasswordSuccess("비밀번호가 변경되었습니다.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPasswordError(result.message || "비밀번호 변경에 실패했습니다.");
            }
        } catch (err) {
            setPasswordError("서버와 연결할 수 없습니다.");
            console.error("비밀번호 변경 오류:", err);
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* 헤더 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">마이페이지</h1>
                    <p className="text-gray-600">
                        {user?.name || user?.username}님, 환영합니다!
                    </p>
                </div>

                {/* 탭 */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === "profile"
                                    ? "text-pink-500 border-b-2 border-pink-500"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            회원정보
                        </button>
                        <button
                            onClick={() => setActiveTab("favorites")}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === "favorites"
                                    ? "text-pink-500 border-b-2 border-pink-500"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            찜한 지역 ({favorites.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("reviews")}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                                activeTab === "reviews"
                                    ? "text-pink-500 border-b-2 border-pink-500"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            내 리뷰 ({reviews.length})
                        </button>
                    </div>
                </div>

                {/* 회원정보 탭 */}
                {activeTab === "profile" && (
                    <div className="space-y-6">
                        {/* 회원정보 수정 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">회원정보 수정</h2>
                                {!editingProfile && (
                                    <button
                                        onClick={() => setEditingProfile(true)}
                                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                                    >
                                        수정하기
                                    </button>
                                )}
                            </div>

                            {profileSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                                    {profileSuccess}
                                </div>
                            )}

                            {profileError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                    {profileError}
                                </div>
                            )}

                            {editingProfile ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            사용자명
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.username || ""}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            사용자명은 변경할 수 없습니다.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            이메일
                                        </label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            이름
                                        </label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                                        >
                                            저장
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingProfile(false);
                                                setEditEmail(user?.email || "");
                                                setEditName(user?.name || "");
                                                setProfileError("");
                                                setProfileSuccess("");
                                            }}
                                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            취소
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            사용자명
                                        </label>
                                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                                            {user?.username}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            이메일
                                        </label>
                                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                                            {user?.email}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            이름
                                        </label>
                                        <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800">
                                            {user?.name}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 비밀번호 변경 */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">비밀번호 변경</h2>

                            {passwordSuccess && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                                    {passwordSuccess}
                                </div>
                            )}

                            {passwordError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                    {passwordError}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        현재 비밀번호
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        새 비밀번호
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        required
                                        minLength={4}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        비밀번호는 최소 4자 이상이어야 합니다.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        새 비밀번호 확인
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                                        required
                                        minLength={4}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={changingPassword}
                                    className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {changingPassword ? "변경 중..." : "비밀번호 변경"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 찜 목록 */}
                {activeTab === "favorites" && (
                    <div className="space-y-4">
                        {favorites.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 text-gray-300 mx-auto mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                                <p className="text-gray-500 text-lg">찜한 지역이 없습니다.</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    지도에서 지역을 클릭하고 찜 버튼을 눌러보세요!
                                </p>
                            </div>
                        ) : (
                            favorites.map((favorite) => (
                                <div
                                    key={favorite.id}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                {favorite.location}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                위도: {favorite.latitude.toFixed(6)}, 경도:{" "}
                                                {favorite.longitude.toFixed(6)}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                찜한 날짜:{" "}
                                                {new Date(favorite.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() =>
                                                    handleLocationClick(
                                                        favorite.latitude,
                                                        favorite.longitude
                                                    )
                                                }
                                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                                            >
                                                지도에서 보기
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRemoveFavorite(
                                                        favorite.latitude,
                                                        favorite.longitude
                                                    )
                                                }
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* 리뷰 목록 */}
                {activeTab === "reviews" && (
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 text-gray-300 mx-auto mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                </svg>
                                <p className="text-gray-500 text-lg">작성한 리뷰가 없습니다.</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    지도에서 지역을 클릭하고 리뷰를 작성해보세요!
                                </p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                {review.location}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-5 w-5 ${
                                                            star <= review.rating
                                                                ? "text-yellow-400 fill-current"
                                                                : "text-gray-300"
                                                        }`}
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            {review.content && (
                                                <p className="text-gray-700 mb-2">{review.content}</p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                작성일: {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() =>
                                                    handleLocationClick(
                                                        review.latitude,
                                                        review.longitude
                                                    )
                                                }
                                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                                            >
                                                지도에서 보기
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPage;
