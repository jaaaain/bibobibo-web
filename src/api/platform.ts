import { DraftData } from "@/types/video";
import {get} from "@/utils/request";

export const apiGetMyDraftVideoList = async (): Promise<Array<DraftData>> => {
  return await get<Array<DraftData>>(`/platform/my/draft`);
}