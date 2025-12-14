const API_BASE_URL = "http://localhost:8080/api";

export const userService = {
    // 회원정보 수정
    updateProfile: async (email, name) => {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, name }),
        });
        return response.json();
    },

    // 비밀번호 변경
    changePassword: async (currentPassword, newPassword) => {
        const response = await fetch(`${API_BASE_URL}/auth/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        return response.json();
    },
};
