import {get, post} from '@/utils/request'
import type { InitUploadDto, InitUploadVO, FinishVO, FileUploadTypeEnum } from '@/types/file'

export const apiInitUpload = async (dto: InitUploadDto): Promise<InitUploadVO> => {
  return await post<InitUploadVO>('/file/upload/init', dto)
}

export const apiFinishUpload = async (uploadId: string): Promise<FinishVO> => {
  return await post<FinishVO>('/file/upload/finish', { params: { uploadId } })
}

export const apiUpload = async (file: File, type: FileUploadTypeEnum): Promise<string> => {
  return await post<string>('/file/preview/url', { file: file, type: type })
}
