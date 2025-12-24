/**
 * API 通用类型定义
 */

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message?: string
  data?: T
}

// API 错误响应类型
export interface ApiErrorResponse {
  code: number
  message: string
}

// 分页请求基础类型
export interface PaginationRequest {
  page: number
  page_size: number
}

// 分页响应基础类型
export interface PaginationResponse<T> {
  page: number
  page_size: number
  total: number
  total_pages: number
  items?: T[]
}
