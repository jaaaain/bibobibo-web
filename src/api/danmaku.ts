import request from '@/utils/request'
import type { Danmaku } from '@/types/danmaku'
import type { PageResult, Result } from '@/types/common'

// 分页列表
export function getListDanmaku(page = 1, size = 10) {
  return request.get<Result<PageResult<Danmaku>>>(`/danmaku/list`, {
    params: { page, size }
  })
}

// 详情
export function getDanmaku(id: number) {
  return request.get<Result<Danmaku>>(`/danmaku/${id}`)
}

// 新增
export function addDanmaku(data: Danmaku) {
  return request.post<Result<boolean>>(`/danmaku`, data)
}

// 修改
export function updateDanmaku(data: Danmaku) {
  return request.put<Result<boolean>>(`/danmaku`, data)
}

// 删除
export function deleteDanmaku(id: number) {
  return request.delete<Result<boolean>>(`/danmaku/${id}`)
}
