// 通用返回结构
export interface Result<T> {
  code: number
  msg: string
  data: T
}

// 分页结构
export interface PageResult<T> {
  total: number
  list: T[]
}
