import {get} from "@/utils/request";

export const apiGetMyDraftVideoList = async (): Promise<any> => {
  return await get<any>(`/platform/my/draft`);
}