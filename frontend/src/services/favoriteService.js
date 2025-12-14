const API_BASE_URL = "http://localhost:8080/api";

export const favoriteService = {
    // 찜 추가
    addFavorite: async (latitude, longitude, location) => {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ latitude, longitude, location }),
        });
        return response.json();
    },

    // 찜 제거
    removeFavorite: async (latitude, longitude) => {
        const response = await fetch(
            `${API_BASE_URL}/favorites?latitude=${latitude}&longitude=${longitude}`,
            {
                method: "DELETE",
                credentials: "include",
            }
        );
        return response.json();
    },

    // 찜 확인
    checkFavorite: async (latitude, longitude) => {
        const response = await fetch(
            `${API_BASE_URL}/favorites/check?latitude=${latitude}&longitude=${longitude}`,
            {
                method: "GET",
                credentials: "include",
            }
        );
        return response.json();
    },

    // 내 찜 목록 조회
    getMyFavorites: async () => {
        const response = await fetch(`${API_BASE_URL}/favorites/me`, {
            method: "GET",
            credentials: "include",
        });
        return response.json();
    },
};
