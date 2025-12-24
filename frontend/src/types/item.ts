/**
 * Item（便签项目）相关类型定义
 */

// Item 状态枚举
export type ItemStatus = 'normal' | 'done' | 'marked'

// Tag DTO
export interface TagDTO {
  tag_id: number
  tag_name: string
  tag_value: string
  icon?: string
  color?: string
}

// Item DTO
export interface ItemDTO {
  item_id: number
  content: string
  status: ItemStatus
  tags: TagDTO[]
  created_at: string
  updated_at: string
}

// 创建 Item 请求
export interface CreateItemRequest {
  content: string
  status?: ItemStatus
  tags?: number[]
}

// 更新 Item 请求
export interface UpdateItemRequest {
  content?: string
  status?: ItemStatus
  tags?: number[]
}

// 获取 Item 列表请求
export interface GetItemListRequest {
  date_start?: string
  date_end?: string
  status?: ItemStatus
  page: number
  page_size: number
}

// 获取 Item 列表响应
export interface GetItemListResponse {
  page: number
  page_size: number
  total: number
  total_pages: number
  items: ItemDTO[]
}

// 每日 Item 数量 DTO
export interface DailyItemCountDTO {
  date: string // "2025-12-19"
  count: number
}

// 获取每日 Item 数量请求
export interface GetDailyItemCountRequest {
  date_start: string
  date_end: string
}

// 获取每日 Item 数量响应
export interface GetDailyItemCountResponse {
  daily_item_counts: DailyItemCountDTO[]
}
