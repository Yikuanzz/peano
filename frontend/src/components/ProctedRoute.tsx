/**
 * 受保护的路由组件
 */
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  // 未登录 → 跳转登录页
  if (!isAuthenticated) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
