import request from '@/utils/request'
import type { Danmaku } from '@/types/danmaku'
import type { PageResult, Result } from '@/types/common'

// 分页列表
export function apiGetListDanmaku(page = 1, size = 10) {
  return request.get<Result<PageResult<Danmaku>>>(`/danmaku/list`, {
    params: { page, size }
  })
}

// 详情
export function apiGetDanmaku(id: number) {
  return request.get<Result<Danmaku>>(`/danmaku/${id}`)
}

// 新增
export function apiAddDanmaku(data: Danmaku) {
  return request.post<Result<boolean>>(`/danmaku`, data)
}

// 修改
export function apiUpdateDanmaku(data: Danmaku) {
  return request.put<Result<boolean>>(`/danmaku`, data)
}

// 删除
export function apiDeleteDanmaku(id: number) {
  return request.delete<Result<boolean>>(`/danmaku/${id}`)
}
