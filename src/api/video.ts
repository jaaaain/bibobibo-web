import request from "@/utils/request"
import type { Result, PageResult } from "@/types/common"
import type { Video } from "@/types/video"

export function apiGetVideoById(id: number) {
  return request.get<Result<Video>>(`/video/${id}`)
}

export function apiGetVideoPage(page: number, size: number) {
  return request.get<Result<PageResult<Video>>>(`/video/page`,
    { params: { page, size } }
  )
}
