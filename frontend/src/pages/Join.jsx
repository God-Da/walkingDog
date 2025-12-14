import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Join = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        email: "",
        name: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.passwordConfirm) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (formData.password.length < 4) {
            setError("비밀번호는 최소 4자 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/join",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username: formData.username,
                        password: formData.password,
                        email: formData.email,
                        name: formData.name,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("회원가입이 완료되었습니다. 로그인해주세요.");
                navigate("/login");
            } else {
                setError(data.message || "회원가입에 실패했습니다.");
            }
        } catch (err) {
            setError("서버와 연결할 수 없습니다.");
            console.error("Join error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-orange-50 py-10 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-4">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        회원가입
                    </h2>
                    <p className="text-sm text-gray-500">
                        산책할개와 함께 시작하세요
                    </p>
                </div>

                {/* 회원가입 카드 */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form className="space-y-2" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* 사용자명 */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                사용자명 *
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                                placeholder="사용자명을 입력하세요"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 이름 */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                이름 *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                                placeholder="이름을 입력하세요"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 이메일 */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                이메일 *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                                placeholder="이메일을 입력하세요"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                비밀번호 *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                                placeholder="비밀번호를 입력하세요 (최소 4자)"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label
                                htmlFor="passwordConfirm"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                비밀번호 확인 *
                            </label>
                            <input
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type="password"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                                placeholder="비밀번호를 다시 입력하세요"
                                value={formData.passwordConfirm}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 회원가입 버튼 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
                        >
                            {loading ? "가입 중..." : "회원가입"}
                        </button>

                        {/* 로그인 링크 */}
                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                이미 계정이 있으신가요?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-pink-500 hover:text-orange-500 transition-colors"
                                >
                                    로그인
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Join;
