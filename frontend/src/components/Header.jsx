import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
            <div className="container mx-auto px-1 py-2">
                <Link to="/">
                    <img src="/logo.png" alt="로고" className="h-14" />
                </Link>
            </div>
        </header>
    );
};

export default Header;
