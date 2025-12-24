/**
 * Tag（标签）相关类型定义
 */

// Tag DTO
export interface TagDTO {
  tag_id: number
  tag_name: string
  tag_value: string
  icon?: string
  color?: string
}

// 创建 Tag 请求
export interface CreateTagRequest {
  tag_name: string
  tag_value: string
  icon?: string
  color?: string
}

// 更新 Tag 请求
export interface UpdateTagRequest {
  tag_name?: string
  tag_value?: string
  icon?: string
  color?: string
}

// 获取 Tag 列表请求
export interface GetTagListRequest {
  page: number
  page_size: number
}

// 获取 Tag 列表响应
export interface GetTagListResponse {
  page: number
  page_size: number
  total: number
  total_pages: number
  tags: TagDTO[]
}
