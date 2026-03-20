// 评论相关的 DTO / VO 定义
import type { BriefVO } from '@/types/user'
import type { PageResult } from '@/types/common'

// ================ DTO 请求参数 ================
export interface CommentCreateDto {
  vid?: number
  rootId?: number
  parentId?: number
  toUid?: number
  content?: string
}

// ================ VO 响应数据 ================
export interface CommentVO {
  id?: number
  vid?: number
  rootId?: number
  parentId?: number
  content?: string
  likeCount?: number
  replyCount?: number
  isTop?: number
  ipLocation?: string
  createTime?: string
  user?: BriefVO
  replyToUser?: BriefVO
  isUpOwner?: boolean
  isLiked?: boolean
  isBad?: boolean
}

// ================ Query / PageResult 辅助类型 ================
export type CommentPageResult = PageResult<CommentVO>
