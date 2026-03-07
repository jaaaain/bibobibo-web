import type { WsRequest, WsResponse } from "@/types/ws"

type MessageHandler = (data: any) => void

class WebSocketClient {

  private ws: WebSocket | null = null
  private handlers: Map<string, MessageHandler[]> = new Map()

  connect(url: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url)
      this.ws.onopen = () => resolve()
      this.ws.onmessage = (event) => {
        const msg: WsResponse = JSON.parse(event.data)
        const list = this.handlers.get(msg.type)
        list?.forEach(fn => fn(msg.data))
      }
      this.ws.onerror = reject
      this.ws.onclose = () => {
        this.ws = null
      }
    })
  }
  send<T>(msg: WsRequest<T>): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("ws not connected")
      return
    }
    this.ws.send(JSON.stringify(msg))
    console.log("WebSocket sent", msg)
  }
  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, [])
    }
    this.handlers.get(type)!.push(handler)
  }
  off(type: string, handler: MessageHandler) {
    const list = this.handlers.get(type)
    if (!list) return
    const index = list.indexOf(handler)
    if (index > -1) {
      list.splice(index, 1)
    }
  }
  close() {
    this.ws?.close()
  }
}
export const wsClient = new WebSocketClient()