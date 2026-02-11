import { ref } from 'vue'
import { apiUpload, apiInitUpload, apiFinishUpload } from '@/api/file'
import SparkMD5 from 'spark-md5'
import { FileUploadStateEnum, FileUploadTypeEnum, UploadStatus } from '@/types/file'

const CHUNK_LIMIT = 5 * 1024 * 1024 // 5MB

export function useUploader() {
    const uploadStatus = ref<UploadStatus>(UploadStatus.Idle)
    const progress = ref<number>(0)

    const upload = async (file: File, uploadType: FileUploadTypeEnum) => {
        console.log("开始上传文件", file, uploadType);
        uploadStatus.value = UploadStatus.Uploading
        progress.value = 0

        /** 1️. 小文件直传 */
        if (file.size < CHUNK_LIMIT) {
            console.log("小文件直传");
            const res = await apiUpload(file, uploadType)
            progress.value = 100
            uploadStatus.value = UploadStatus.Done
            return res.path
        }

        /** 2️. 分片上传 */
        const md5 = SparkMD5.ArrayBuffer.hash(await file.arrayBuffer())
        const init = await apiInitUpload({
            fileName: file.name,
            fileSize: file.size,
            fileMd5: md5,
            type: uploadType
        })

        if (init.state === FileUploadStateEnum.Completed) { // redis缓存已存在该文件，秒传
            progress.value = 100
            uploadStatus.value = UploadStatus.Done
            return init.path
        }
        let uploadedBytes = 0

        const chunkSize = init.chunkSize
        const partUrls = init.partUrls
        for (let i = 0; i < partUrls.length; i++) {
            console.log(`上传分片 ${i + 1}/${partUrls.length}`);
            const start = i * chunkSize
            const end = Math.min(start + chunkSize, file.size)
            const blob = file.slice(start, end)

            await uploadChunk(partUrls[i], blob)

            uploadedBytes += blob.size
            progress.value = Math.round(
                (uploadedBytes / file.size) * 100
            )
        }

        const res = await apiFinishUpload(init.uploadId)
        console.log("完成上传文件，结果：", res);

        progress.value = 100
        uploadStatus.value = UploadStatus.Done
        return res.path
    }

    return {
        uploadStatus,
        progress,
        upload
    }
}

function uploadChunk(url: string, blob: Blob) {
    return fetch(url, {
        method: 'PUT',
        body: blob
    })
}

