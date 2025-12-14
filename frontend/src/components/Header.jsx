import React from "react";
import { Link } from "react-router-dom";
import { GoSignIn, GoPersonAdd } from "react-icons/go";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
            <div className="container mx-auto py-2 flex items-center justify-between">
                {/* 왼쪽: 로고 */}
                <Link to="/">
                    <img src="/logo.png" alt="로고" className="h-14" />
                </Link>

                {/* 오른쪽: 로그인 / 회원가입 */}
                <div className="flex items-center gap-6">
                    <Link to="/login" className="flex items-center gap-1">
                        <GoSignIn />
                        <span className="text-xs">로그인</span>
                    </Link>
                    <Link to="/signup" className="flex items-center gap-1">
                        <GoPersonAdd />
                        <span className="text-xs">회원가입</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
