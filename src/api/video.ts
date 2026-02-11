import { get, post, del } from "@/utils/request"
import type { PageResult } from "@/types/common"
import type { VideoDataCardVO, VideoDataDetailVO, DraftData, VideoQuery } from "@/types/video"

// 获取视频详情
export const apiGetVideoById = async (id: string): Promise<VideoDataDetailVO> => {
  return await get<VideoDataDetailVO>(`/video/${id}`)
}

// 创建草稿
export const apiCreateDraft = async (url: string, title: string): Promise<DraftData> => {
  const form = new FormData()
  form.append('url', url)
  form.append('title', title)
  return await post<DraftData>(`/video/create-draft`, form)
}
// 获取草稿信息
export const apiGetDraftById = async (id: string): Promise<DraftData> => {
  return await get<DraftData>(`/video/draft/${id}`)
}

// 更新视频信息
export const apiUpdateVideo = async (dto: DraftData): Promise<void> => {
  return await post<void>(`/video/update`, dto)
}

// 发布视频（提交审核）
export const apiPublishVideo = async (id: string): Promise<void> => {
  return await post<void>(`/video/publish/${id}`)
}

// 删除视频
export const apiDeleteVideo = async (id: string): Promise<boolean> => {
  return await del<boolean>(`/video/${id}`)
}

// 获取公开视频列表（分页）
export const apiGetVideoPage = async (page: number, size: number): Promise<PageResult<VideoDataCardVO>> => {
  return await get<PageResult<VideoDataCardVO>>(`/video/page`, { page, size })
}

// 获取我的视频（需要登录）
export const apiGetMyVideoPage = async (page: number, size: number): Promise<PageResult<VideoDataCardVO>> => {
  return await get<PageResult<VideoDataCardVO>>(`/video/page/my`, { page, size })
}
