import request from "@/utils/request";

// 获取用户信息
export const apiGetUserInfo = () => {
  return request.get('/user/info');
}

// 用户登录
export const apiLogin = (username: string, password: string) => {
  return request.post('/login', { username, password }
  );
}