import { get, post } from "@/utils/request";
import type { SelfProfileVO, SelfCardVO } from '@/types/user'

export const apiGetUserDetail = async (username: string): Promise<SelfProfileVO> => {
  return await get<SelfProfileVO>(`/user/detail`);
}

export const apiGetUserSimple = async (): Promise<SelfCardVO> => {
  return await get<SelfCardVO>(`/user/info`);
}

// 用户登录
export const apiLogin = async (username: string, password: string): Promise<string> => {
  return await post<string>(`/user/login`, { username, password });
}

export const apiLogout = async (): Promise<boolean> => {
  return await post<boolean>(`/user/logout`);
}