import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 1. 헤더 */}
      <Header />
      {/* 2. 본문 */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
      {/* 3. 푸터 */}
      <Footer />
    </div>
  );
};

export default Layout;
