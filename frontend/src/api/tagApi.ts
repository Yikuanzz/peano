/**
 * Tag 相关 API
 */
import { http, type ApiResponse } from "@/utils/http";
import type {
  TagDTO,
  CreateTagRequest,
  UpdateTagRequest,
  GetTagListRequest,
  GetTagListResponse,
} from "@/types/tag";

// 创建 Tag
export async function createTag(data: CreateTagRequest): Promise<TagDTO> {
  const response = await http.post<ApiResponse<TagDTO>>("/tag", data);
  return response.data.data!;
}

// 获取单个 Tag
export async function getTag(tagId: number): Promise<TagDTO> {
  const response = await http.get<ApiResponse<TagDTO>>(`/tag/${tagId}`);
  return response.data.data!;
}

// 更新 Tag
export async function updateTag(
  tagId: number,
  data: UpdateTagRequest
): Promise<TagDTO> {
  const response = await http.put<ApiResponse<TagDTO>>(`/tag/${tagId}`, data);
  return response.data.data!;
}

// 删除 Tag
export async function deleteTag(tagId: number): Promise<void> {
  await http.delete(`/tag/${tagId}`);
}

// 获取 Tag 列表
export async function getTagList(
  params: GetTagListRequest
): Promise<GetTagListResponse> {
  const response = await http.get<ApiResponse<GetTagListResponse>>(
    "/tag/list",
    {
      params,
    }
  );
  return response.data.data!;
}
