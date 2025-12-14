import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Join from "./pages/Join";
import MyPage from "./pages/MyPage";

function App() {
    return (
        <BrowserRouter>
            {/* Layout으로 전체를 감싸면 모든 페이지에 헤더/푸터가 적용됨 */}
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/join" element={<Join />} />
                    <Route path="/mypage" element={<MyPage />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
