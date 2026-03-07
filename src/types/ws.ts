export interface WsRequest<T = any> {
  type: string
  videoId?: number
  data?: T
}

export interface WsResponse<T = any> {
  type: string
  data?: T
}