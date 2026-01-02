import {get, post} from '@/utils/request'
import type { Danmaku } from '@/types/danmaku'
import type { PageResult } from '@/types/common'

// 分页列表
export const apiGetListDanmaku = async (page: number, size: number): Promise<PageResult<Danmaku>> => {
  return await get<PageResult<Danmaku>>(`/danmaku/list`, {
    params: { page, size }
  })
}

// 详情
export const apiGetDanmaku = async (id: number): Promise<Danmaku> => {
  return await get<Danmaku>(`/danmaku/detail/${id}`)
}

// 新增
export const apiAddDanmaku = async (data: Danmaku): Promise<boolean> => {
  return await post<boolean>(`/danmaku/create`, data)
}

// 修改
export const apiUpdateDanmaku = async (data: Danmaku): Promise<boolean> => {
  return await post<boolean>(`/danmaku/update`, data)
}

// 删除
export const apiDeleteDanmaku = async (id: number): Promise<boolean> => {
  return await post<boolean>(`/danmaku/delete${id}`)
}
