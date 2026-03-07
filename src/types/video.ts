import { UUID } from "crypto"
import { UploadTaskModel } from "./file"
// ================ DTO 请求参数 ================

// ================ VO 响应数据 ================
// 视频数据统计VO
export interface VideoDataStatVO {
  play?: number
  danmaku?: number
  like?: number
  favorite?: number
  share?: number
  coin?: number
}
// 视频列表卡片VO
export interface VideoDataCardVO {
  id: number
  title: string
  coverUrl?: string
  duration?: number
  releaseTime?: string
  stat?: VideoDataStatVO // 统计信息VO
  owner?: any
}
// 视频草稿信息VO  // 更新视频信息DTO
export interface DraftData {
  id: number
  title: string
  introduction?: string
  coverUrl?: string
  videoUrl?: string
  tags?: string
  type?: VideoType
  visible?: VideoVisible
}
// 视频播放页详情VO
export interface VideoDataDetailVO {
  id: number
  title: string
  introduction?: string
  coverUrl?: string
  videoUrl?: string
  tags?: string
  type?: VideoType
  visible?: VideoVisible
  state?: VideoState
  releaseTime?: string
  duration?: number
  statVO?: VideoDataStatVO // 统计信息VO
  owner?: any
}
// 视频关联关系VO
export interface VideoRelationVO {
  attention?: boolean
  favorite?: boolean
  like?: boolean
  dislike?: boolean
  coin?: number
}
// ================ Query 查询条件 ================
export interface VideoQuery {
  page?: number
  size?: number
  uid?: number
  title?: string
  titleLike?: string
  introduction?: string
  duration?: number
  durationMin?: number
  durationMax?: number
  tags?: string
  type?: VideoType
  visible?: VideoVisible
  state?: VideoState
  releaseTime?: string
  releaseTimeMin?: string
  releaseTimeMax?: string
  updateTime?: string
  updateTimeMin?: string
  updateTimeMax?: string
}
// =============== Model 数据模型 ============
// 草稿数据模型
export interface DraftModel{
  draftData: DraftData
  uploadTask: Ref<UploadTaskModel>; // 前端专用
}

// ================ Enum 枚举 ================
// 视频来源枚举
export enum VideoType {
  UNKNOWN = -1, // 未知
  ORIGINAL = 0, // 原创
  REPRINT = 1   // 转载
}
// 视频可见性枚举
export enum VideoVisible {
  PUBLIC = 0, // 公开
  PRIVATE = 1 // 私密
}
// 视频状态枚举
export enum VideoState {
  DRAFT = -1, // 草稿
  REVIEWING = 0, // 审核中
  APPROVED = 1, // 已通过
  VIOLATION_DELETE = 2 // 违规删除
}





