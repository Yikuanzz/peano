/**
 * Item 相关 API
 */
import { http, type ApiResponse } from '@/utils/http'
import type {
  ItemDTO,
  CreateItemRequest,
  UpdateItemRequest,
  GetItemListRequest,
  GetItemListResponse,
  GetDailyItemCountRequest,
  GetDailyItemCountResponse,
} from '@/types/item'

// 创建 Item
export async function createItem(data: CreateItemRequest): Promise<ItemDTO> {
  const response = await http.post<ApiResponse<ItemDTO>>('/item', data)
  return response.data.data!
}

// 获取单个 Item
export async function getItem(itemId: number): Promise<ItemDTO> {
  const response = await http.get<ApiResponse<ItemDTO>>(`/item/${itemId}`)
  return response.data.data!
}

// 更新 Item
export async function updateItem(itemId: number, data: UpdateItemRequest): Promise<ItemDTO> {
  const response = await http.put<ApiResponse<ItemDTO>>(`/item/${itemId}`, data)
  return response.data.data!
}

// 删除 Item
export async function deleteItem(itemId: number): Promise<void> {
  await http.delete(`/item/${itemId}`)
}

// 获取 Item 列表
export async function getItemList(params: GetItemListRequest): Promise<GetItemListResponse> {
  const response = await http.get<ApiResponse<GetItemListResponse>>('/item/list', {
    params,
  })
  return response.data.data!
}

// 获取每日 Item 数量统计
export async function getDailyItemCount(
  params: GetDailyItemCountRequest
): Promise<GetDailyItemCountResponse> {
  const response = await http.get<ApiResponse<GetDailyItemCountResponse>>('/item/daily-count', {
    params,
  })
  return response.data.data!
}
