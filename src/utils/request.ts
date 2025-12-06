import axios from 'axios'

const request = axios.create({
  baseURL: '/api',   // 统一前缀，配合 Vite 代理
  timeout: 5000
})

// 请求拦截
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截
request.interceptors.response.use(
  response => response.data,
  error => {
    // 这里你可以加入全局提示，比如刷新 token、跳登录页
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default request
