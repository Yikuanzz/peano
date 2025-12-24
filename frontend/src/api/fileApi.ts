/**
 * 文件相关 API 接口
 */
import { http, type ApiResponse } from '@/utils/http'
import type { FileUploadResponse } from '@/types/file'

/**
 * 上传文件
 */
export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await http.post<ApiResponse<FileUploadResponse>>('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data!
}
