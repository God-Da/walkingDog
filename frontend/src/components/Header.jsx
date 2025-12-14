import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoSignIn, GoPersonAdd } from "react-icons/go";

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로그인 상태 확인
  useEffect(() => {
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
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
      <div className="container mx-auto py-2 flex items-center justify-between">
        {/* 왼쪽: 로고 */}
        <Link to="/">
          <img src="/logo.png" alt="로고" className="h-14" />
        </Link>

        {/* 오른쪽: 로그인 상태에 따른 버튼 */}
        <div className="flex items-center gap-6">
          {loading ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : user ? (
            // 로그인된 경우: 사용자명, 마이페이지, 로그아웃
            <>
              <Link
                to="/mypage"
                className="flex items-center gap-2 text-gray-700 hover:text-pink-500 transition-colors"
              >
                <span className="text-sm font-medium">{user.name || user.username}</span>
              </Link>
              <Link
                to="/mypage"
                className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-xs">마이페이지</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-600 hover:text-pink-500 transition-colors"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-xs">로그아웃</span>
              </button>
            </>
          ) : (
            // 로그인되지 않은 경우: 로그인, 회원가입
            <>
              <Link to="/login" className="flex items-center gap-1">
                <GoSignIn />
                <span className="text-xs">로그인</span>
              </Link>
              <Link to="/join" className="flex items-center gap-1">
                <GoPersonAdd />
                <span className="text-xs">회원가입</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
