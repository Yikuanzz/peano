import Login from "@/pages/Login";
import { Toaster } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFoundPage from "@/pages/NotFound";
import Home from "@/pages/Home";
import Archive from "@/pages/Archive";
import Profile from "@/pages/Profile";
import ProtectedRoute from "@/components/ProctedRoute";
import AppLayout from "@/components/layout/AppLayout";

function App() {
  const { init } = useAuthStore();

  // 初始化：从 localStorage 恢复状态
  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <BrowserRouter basename="/peano">
        <Routes>
          {/* 登录页 */}
          <Route path="/login" element={<Login />} />
          {/* 受保护的主应用 */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* 默认首页 */}
              <Route index element={<Navigate to="home" replace />} />

              <Route path="home" element={<Home />} />
              <Route path="archive" element={<Archive />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* 404页面 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </>
  );
}

export default App;
