/**
 * 用户相关 API 接口
 */

import { http, type ApiResponse } from "@/utils/http";
import type {
  LoginRequest,
  LoginResponse,
  User,
  UpdateUserInfoRequest,
  UpdateUserInfoResponse,
} from "@/types/user";

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await http.post<ApiResponse<LoginResponse>>(
    "/user/login",
    data
  );
  return response.data.data!;
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<User> {
  const response = await http.get<ApiResponse<User>>("/user/info");
  return response.data.data!;
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(
  data: UpdateUserInfoRequest
): Promise<UpdateUserInfoResponse> {
  const response = await http.put<ApiResponse<UpdateUserInfoResponse>>(
    "/user/info",
    data
  );
  return response.data.data!;
}
