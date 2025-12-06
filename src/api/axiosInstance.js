import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://127.0.0.1:8000/api',
  timeout: 30000, // 请求超过30秒则判定为超时
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response;
  },
  error => {
    // 对响应错误做点什么
    if (error.response) {
      // 请求已发出，但是不在2xx范围内
      console.error('Error:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      // 发生在设置请求时或请求被取消时的错误
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default instance;