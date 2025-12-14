import { useState, useEffect } from "react";
import { reviewService } from "../services/reviewService";

const ReviewSection = ({ latitude, longitude, location }) => {
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (latitude && longitude) {
            loadReviews();
        }
    }, [latitude, longitude]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const result = await reviewService.getLocationReviews(latitude, longitude);
            if (result.success && result.data) {
                setReviews(result.data.reviews || []);
                setAverageRating(result.data.averageRating || 0);
                setReviewCount(result.data.reviewCount || 0);
            }
        } catch (err) {
            console.error("리뷰 로드 오류:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError("별점을 선택해주세요.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const result = await reviewService.addOrUpdateReview(
                latitude,
                longitude,
                location,
                rating,
                content
            );
            if (result.success) {
                setShowForm(false);
                setRating(0);
                setContent("");
                loadReviews(); // 리뷰 목록 새로고침
            } else {
                setError(result.message || "리뷰 작성에 실패했습니다.");
            }
        } catch (err) {
            setError("서버와 연결할 수 없습니다.");
            console.error("리뷰 작성 오류:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!latitude || !longitude) return null;

    return (
        <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">리뷰</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="text-sm text-pink-500 hover:text-pink-600 font-medium"
                >
                    {showForm ? "취소" : "리뷰 작성"}
                </button>
            </div>

            {/* 평균 별점 및 리뷰 개수 */}
            {reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-3 text-sm">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ${
                                    star <= Math.round(averageRating)
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
                    <span className="text-gray-600">
                        {averageRating.toFixed(1)} ({reviewCount}개)
                    </span>
                </div>
            )}

            {/* 리뷰 작성 폼 */}
            {showForm && (
                <form onSubmit={handleSubmitReview} className="mb-4 p-3 bg-gray-50 rounded-lg">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs mb-2">
                            {error}
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            별점
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`${
                                        star <= rating
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                    } hover:text-yellow-400 transition-colors`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 fill-current"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            리뷰 내용
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                            rows="3"
                            placeholder="리뷰를 작성해주세요..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                        {submitting ? "작성 중..." : "리뷰 작성"}
                    </button>
                </form>
            )}

            {/* 리뷰 목록 */}
            {loading ? (
                <div className="text-center py-4 text-gray-500 text-sm">로딩 중...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                    아직 리뷰가 없습니다.
                </div>
            ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-gray-800">
                                        {review.userName || review.username}
                                    </span>
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-3 w-3 ${
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
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {review.content && (
                                <p className="text-sm text-gray-700 mt-1">{review.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
