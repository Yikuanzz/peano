/**
 * HTTP 客户端配置模块
 */
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "./env";

// 创建 axios 实例
export const http = axios.create({
  baseURL: `${env.apiUrl}${env.apiPrefix}`,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// 是否正在刷新 token
let isRefreshing = false;
// 等待刷新 token 的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 添加到刷新队列
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// 通知刷新队列
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// 刷新 token
async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  try {
    const response = await axios.post<
      ApiResponse<{ access_token: string; refresh_token: string }>
    >(`${env.apiUrl}${env.apiPrefix}/user/refresh-token`, {
      refresh_token: refreshToken,
    });

    if (response.data.code === 0 && response.data.data) {
      const { access_token, refresh_token: new_refresh_token } =
        response.data.data;

      // 保存新的 token
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", new_refresh_token);

      return access_token;
    }

    throw new Error("Token refresh failed");
  } catch (error) {
    // 刷新失败，清除本地存储并跳转到登录页
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    window.location.href = "/login";
    throw error;
  }
}

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 处理 401 未授权错误
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // 如果正在刷新 token，将请求加入队列
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(http(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 刷新 token
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        // 通知队列中的请求
        onTokenRefreshed(newToken);

        // 重试原始请求
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return http(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API 错误响应类型
interface ApiErrorResponse {
  code: number;
  message: string;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}
