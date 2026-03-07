import { get, post } from '@/utils/request'
import type { Danmaku } from '@/types/danmaku'
import type { PageResult } from '@/types/common'
import { wsClient } from "@/utils/websocket"
import { c } from 'naive-ui'

// 分页列表
export const apiGetListDanmaku = async (vid: number): Promise<Danmaku[]> => {
  return await get<Danmaku[]>(`/dm/list/${vid}`)
}

// 删除
export const apiDeleteDanmaku = async (id: number): Promise<boolean> => {
  return await post<boolean>(`/dm/delete/${id}`)
}


export function connectDanmaku() {
  return wsClient.connect("ws://localhost:7071/ws/danmaku")
}

export function joinVideo(videoId: number) {
  console.log("加入视频", videoId)
  return wsClient.send({ type: "join", videoId })
}

export function leaveVideo(videoId: number) {
  wsClient.send({ type: "leave", videoId })
}

export function sendDanmaku(videoId: number, danmaku: Danmaku) {
  wsClient.send({ type: "danmaku", videoId, data: danmaku })
}

export function onDanmaku(callback: (danmaku: Danmaku) => void) {
  wsClient.on("danmaku", callback)
}

export function onViewerCount(callback: (count: number) => void) {
  wsClient.on("viewerCount", callback)
}