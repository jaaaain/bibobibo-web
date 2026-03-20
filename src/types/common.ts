// 通用返回结构
export interface Result<T = any> {
  code: number
  msg: string
  data: T
}

// 分页结构
export interface PageResult<T = any> {
  total?: number
  list: T[]
  nextCursor?: string
  hasMore?: boolean
}

export interface BaseQuery {
  page?: number
  size?: number
}