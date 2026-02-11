// ================ DTO 请求参数 ================
// 初始化上传请求参数
export interface InitUploadDto {
	fileName: string
	fileSize: number
	fileMd5: string
    type: FileUploadTypeEnum
}
// ================ VO 响应数据 ================
// 初始化上传响应数据
export interface InitUploadVO {
	state: FileUploadStateEnum
	uploadId: string
	chunkSize: number
	totalParts: number
	partUrls: string[]
	path: string
}
// 完成上传响应数据
export interface UploadResultVO {
	etag?: string
	path?: string
}
// ================ Query 查询条件 ================


// =============== Model 数据模型 ================
// 上传任务数据模型
export interface UploadTaskModel {
  title: string
  progress: number
  status: UploadStatus
}
// ================ Enum 枚举 ================
// 文件上传类型枚举
export enum FileUploadTypeEnum {
	File = "file",   // 文件
	Video = "video",   // 视频
	Picture = "picture", // 图片
	Avatar = "avatar", // 头像
	Cover = "cover"   // 封面
}
// 上传状态枚举
export enum UploadStatus {
	Idle = 'idle',             	 // 待上传
	Uploading = 'uploading',     // 上传中
	Paused = 'paused',           // 暂停
	Done = 'done',               // 上传完成
	Error = 'error'              // 出错
}
export enum FileUploadStateEnum {
	Init = 0,    // 初始化完成
	Resume = 1,     // 上传中
	Completed = 2       // 上传完成
}
