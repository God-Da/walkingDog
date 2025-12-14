const API_BASE_URL = "http://localhost:8080/api";

export const reviewService = {
    // 리뷰 작성/수정
    addOrUpdateReview: async (latitude, longitude, location, rating, content) => {
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ latitude, longitude, location, rating, content }),
        });
        return response.json();
    },

    // 리뷰 삭제
    deleteReview: async (reviewId) => {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
            method: "DELETE",
            credentials: "include",
        });
        return response.json();
    },

    // 위치별 리뷰 조회
    getLocationReviews: async (latitude, longitude) => {
        const response = await fetch(
            `${API_BASE_URL}/reviews/location?latitude=${latitude}&longitude=${longitude}`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        return response.json();
    },

    // 내 리뷰 목록 조회
    getMyReviews: async () => {
        const response = await fetch(`${API_BASE_URL}/reviews/me`, {
            method: "GET",
            credentials: "include",
        });
        return response.json();
    },
};
