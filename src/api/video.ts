import { get, post, del } from "@/utils/request"
import type { PageResult } from "@/types/common"
import type { VideoDataCardVO, VideoDataDetailVO, VideoQuery, VideoUpdateDto } from "@/types/video"

// 获取视频详情
export const apiGetVideoById = async (id: number): Promise<VideoDataDetailVO> => {
  return await get<VideoDataDetailVO>(`/video/${id}`)
}

// 创建草稿（后端接口使用 RequestParam：url, title, fileKey）
export const apiCreateDraft = async (url: string, title: string, fileKey: string): Promise<Video> => {
  const params = new URLSearchParams({ url, title, fileKey }).toString()
  return await post<Video>(`/video/create-draft?${params}`)
}

// 更新视频信息（RequestBody）
export const apiUpdateVideo = async (dto: VideoUpdateDto): Promise<void> => {
  return await post<void>(`/video/update`, dto)
}

// 发布视频（提交审核）
export const apiPublishVideo = async (id: number): Promise<void> => {
  return await post<void>(`/video/publish/${id}`)
}

// 删除视频
export const apiDeleteVideo = async (id: number): Promise<boolean> => {
  return await del<boolean>(`/video/${id}`)
}

// 获取公开视频列表（分页）
export const apiGetVideoPage = async (page: number, size: number): Promise<PageResult<VideoDataCardVO>> => {
  return await get<PageResult<VideoDataCardVO>>(`/video/page`, { page, size })
}

// 获取我的视频（需要登录）
export const apiGetMyVideoPage = async (page: number, size: number): Promise<PageResult<Video>> => {
  return await get<PageResult<Video>>(`/video/page/my`, { page, size })
}
