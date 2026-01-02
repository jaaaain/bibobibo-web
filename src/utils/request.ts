import axios, { AxiosInstance, InternalAxiosRequestConfig , AxiosResponse } from 'axios'
import type { Result } from '@/types/common'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig ) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {} as any
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error) // 把错误往外抛，使业务代码能捕获
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    // 统一处理后端通用格式
    const res = response.data // 取data（Result）

    if (res.code !== 200) {
      // 你可以在此加入全局错误提示
      console.error('API Error:', res.msg)
      return Promise.reject(res)
    }

    return res.data as any // data的data（Result<T>中的T）
  },
  error => Promise.reject(error)
)

// =======================
// 核心封装：统一泛型函数
// =======================
export function post<R = any>(url: string, data?: any) {
  return request.post<any, R>(url, data) // any是为了跳过axios的默认响应类型限制
}

export function get<R = any>(url: string, params?: any) {
  return request.get<any, R>(url, { params })
}

export function del<R = any>(url: string, params?: any) {
  return request.delete<any, R>(url, { params })
}

export default {
  get,
  post,
  del
}
