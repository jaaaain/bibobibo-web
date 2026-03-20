import { get, post, del } from '@/utils/request'
import type { CommentVO, CommentCreateDto, CommentPageResult } from '@/types/comment'
import type { PageResult } from '@/types/common'

// 获取根评论列表（feed）
export const apiGetRootComments = async (params: {
  vid: number
  sortType?: string
  cursor?: string | number
  size?: number
}): Promise<PageResult<CommentVO[]>> => {
  return await get<PageResult<CommentVO[]>>(`/comment/list`, params)
}

// 获取评论总数
export const apiGetCommentCount = async (vid: number): Promise<number> => {
  return await get<number>(`/comment/count`, { vid })
}

// 获取子评论（分页）
export const apiGetReplies = async (rootId: number, page = 1, size = 5): Promise<PageResult<CommentVO>> => {
  return await get<PageResult<CommentVO>>(`/comment/replies`, { rootId, page, size })
}

// 发表评论（根评论或回复）
export const apiCreateComment = async (dto: CommentCreateDto): Promise<CommentVO> => {
  return await post<CommentVO>(`/comment/create`, dto)
}

// 删除评论
export const apiDeleteComment = async (id: number): Promise<void> => {
  return await del<void>(`/comment/${id}`)
}

// 点赞评论
export const apiLikeComment = async (id: number): Promise<void> => {
  return await post<void>(`/comment/${id}/like`)
}

// 取消点赞
export const apiCancelLikeComment = async (id: number): Promise<void> => {
  return await post<void>(`/comment/${id}/cancel-like`)
}

// 点踩评论
export const apiDislikeComment = async (id: number): Promise<void> => {
  return await post<void>(`/comment/${id}/bad`)
}

// 置顶评论（仅视频作者）
export const apiTopComment = async (id: number): Promise<void> => {
  return await post<void>(`/comment/${id}/top`)
}

// 取消置顶
export const apiUnTopComment = async (id: number): Promise<void> => {
  return await post<void>(`/comment/${id}/untop`)
}
