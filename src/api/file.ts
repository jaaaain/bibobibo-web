import {get, post} from '@/utils/request'
import type { InitUploadDto, InitUploadVO, UploadResultVO, FileUploadTypeEnum } from '@/types/file'

export const apiInitUpload = async (dto: InitUploadDto): Promise<InitUploadVO> => {
  return await post<InitUploadVO>('/file/upload/init', dto)
}

export const apiFinishUpload = async (uploadId: string): Promise<UploadResultVO> => {
  return await post<UploadResultVO>('/file/upload/finish', { params: { uploadId } })
}

export const apiUpload = async (file: File, type: FileUploadTypeEnum): Promise<UploadResultVO> => {
  return await post<UploadResultVO>('/file/upload/upload', { file: file, type: type })
}
