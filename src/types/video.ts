// ================ DTO 请求参数 ================
// 更新视频信息DTO
export interface VideoUpdateDto {
  id: number
  title?: string
  introduction?: string
  coverUrl?: string
  tags?: string
  type?: VideoType
  visible?: VideoVisible
}
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
  id: string
  title: string
  coverUrl?: string
  duration?: number
  releaseTime?: string
  stat?: VideoDataStatVO
  owner?: any
}
// 视频草稿信息VO
export interface VideoDraftVO {
  id: string
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
  id: string
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
  statVO?: VideoDataStatVO
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
// =============== Model 数据模型 ================



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





