// ================ DTO 请求参数 ================
export interface LoginDto {
  username?: string
  password?: string
}
export interface RegisterDto {
  username?: string
  password?: string
  phone?: string
}
export interface AuthDto {
  id?: number
  username?: string
  role?: Role
  token?: string
}
// ================ VO 响应数据 ================
// 最小用户信息
export interface BriefVO {
  id?: number
  avatar?: string
  nickname?: string
}
// 用户统计数据
export interface StatVO {
  follows?: number
  fans?: number
  likes?: number
  plays?: number
  videos?: number
}

// 个人信息缩要
export interface SelfCardVO {
  id?: number
  avatar?: string
  nickname?: string
  exp?: number
  level?: number
  vip?: Vip
  coin?: number
  state?: State
  stat?: StatVO
}
// 用户卡片信息
export interface CardVO {
  id?: number
  avatar?: string
  nickname?: string
  signature?: string
  gender?: Gender
  level?: number
  vip?: Vip
  state?: State
  stat?: StatVO
}

// 个人主页信息
export interface SelfProfileVO {
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  background?: string
  signature?: string
  birthday?: string
  gender?: Gender
  exp?: number
  level?: number
  coin?: number
  vip?: Vip
  state?: State
  stat?: StatVO
}
// 进入别人主页
export interface PublicProfileVO {
  id?: number
  nickname?: string
  avatar?: string
  signature?: string
  birthday?: string
  gender?: Gender
  vip?: Vip
  level?: number
  state?: State
  stat?: StatVO
}
// ================ Query 查询条件 ================

// =============== Model 数据模型 ================



// ================ Enum 枚举 ================
export enum Vip{
  NONE = 0, // 非VIP
  MONTHLY = 1, // 月度VIP
  YEARLY = 2 // 年度VIP
}
export enum Gender{
  SECRET = 0, // 保密
  MALE = 1,   // 男
  FEMALE = 2  // 女
}
export enum State{
  NORMAL = 0, // 正常
  BANNED = 1  // 封禁
}
export enum Role {
  USER = 0, // 普通用户
  ADMIN = 1 // 管理员
}