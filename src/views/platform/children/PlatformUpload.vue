<template>
  <div class="upload-layout">
    <div class="upload-basic">
      <!-- 上传区 / 任务条 -->
      <div class="video-up">
        <div class="upload-header">发布视频</div>
        <!-- 上传区 -->
        <div v-if="uploadTasks.length === 0" class="upload-drop" @drop.prevent="onDrop" @dragover.prevent>
          <div class="upload-inner">
            <div class="upload-icon" aria-hidden="true">
              <svg t="1766312771695" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="1592" width="93" height="120">
                <path
                  d="M783.104 394.656c-46.432-115.008-159.072-196.128-290.592-196.128-167.04 0-303.36 130.496-312.96 295.072a166.464 166.464 0 0 0 19.008 331.904h244.864v-137.152H306.272L512 414.08l205.76 274.272h-137.152v137.152h195.936a215.456 215.456 0 0 0 6.56-430.848z m0 0"
                  fill="#CDCDCD" p-id="1593"></path>
              </svg>
            </div>
            <p class="hint">点击上传或将视频拖拽到此区域</p>
            <input id="video-file-input" class="file-overlay-input" type="file" ref="fileInput" @change="onFileChange"
              accept="video/*" @drop.prevent="onDrop" @dragover.prevent />
            <div class="upload-btn" aria-hidden="true">上传视频</div>
          </div>
        </div>

        <!-- 上传队列 -->
        <div v-else class="upload-queue">
          <!-- 草稿项目列表 -->
          <div class="task-list">
            <div v-for="(t, idx) in uploadTasks" :key="idx" :class="['task-list-item', { selected: idx === selectedIndex }]"
              @click="selectTask(idx)">
              <div class="task-title">{{ t.title }}</div>
            </div>
          </div>
          <button class="add-btn">添加分p</button>
          <!-- 上传文件列表 -->
          <div class="file-list">
            <div class="file-list-item">
              <div class="file-item-icon"></div>
              <div class="file-item-content">
                <div class="file-item-content-detail">
                  <div class="title">{{ selectedTask.title }}</div>
                  <div class="status">上传完成</div>
                </div>
                <div class="file-item-content-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: selectedTask.progress + '%' }"></div>
                  </div>
                  <div class="progress-text">{{ selectedTask.progress }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 基本设置 -->
      <div class="form">
        <div class="panel">
          <h3>基本设置</h3>
          <div v-if="!selectedTask" class="empty">
            请选择左侧任务或先上传视频
          </div>

          <form v-else @submit.prevent="submitTask">
            <div class="form-row">
              <label>封面</label>
              <input type="file" accept="image/*" @change="onCoverChange" />
              <img v-if="coverPreview" :src="coverPreview" class="cover-preview" />
            </div>

            <div class="form-row">
              <label>标题</label>
              <input v-model="selectedTask.title" placeholder="请输入视频标题" />
            </div>

            <div class="form-row">
              <label>简介</label>
              <textarea v-model="selectedTask.introduction" rows="4" placeholder="视频简介（选填）"></textarea>
            </div>

            <div class="form-actions">
              <button type="submit">提交投稿</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import type { InitUploadDto, InitUploadVO, FinishVO, UploadTaskModel } from "@/types/file";
import { apiInitUpload, apiFinishUpload, apiUpload } from "@/api/file";
import { sv } from "element-plus/es/locale";
import { apiGetMyDraftVideoList } from "@/api/platform";
import type { Video } from "@/types/video";
import { FileUploadStateEnum, FileUploadTypeEnum, UploadStatus } from "@/types/file";
import { SparkMD5 } from 'spark-md5';

// tasks 既显示已有草稿（Video）
const uploadTasks = ref<Array<UploadTaskModel>>([])
const loading = ref(false)
const selectedIndex = ref<number | null>(null);
const coverPreview = ref<string | null>(null);

// ===================== 草稿项目相关方法 =====================
// 获取草稿项目列表
const loadTasks = async () => {
  loading.value = true
  try {
    uploadTasks.value = await apiGetMyDraftVideoList()
    console.log("加载草稿", uploadTasks.value)
  } finally {
    loading.value = false
  }
}
onMounted(loadTasks)
// 选中的草稿项目
const selectedTask = computed(() =>
  selectedIndex.value === null ? null : (uploadTasks.value[selectedIndex.value] as UploadTaskModel)
);
// 选择草稿项目
function selectTask(idx: number) {
  selectedIndex.value = idx;
}
// 删除草稿项目
function deleteTask(idx: number) {
  uploadTasks.value.splice(idx, 1);
  if (selectedIndex.value !== null) {
    if (idx === selectedIndex.value)
      selectedIndex.value = uploadTasks.value.length ? 0 : null;
    else if (idx < selectedIndex.value) selectedIndex.value!--;
  }
}
// ===================== 文件上传相关方法 =====================
// 文件拖拽上传或点击上传触发
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;
  handleNewTask(input.files[0]);
}
function onDrop(e: DragEvent) {
  if (!e.dataTransfer) return;
  const file = e.dataTransfer.files[0];
  if (file) handleNewTask(file);
}

// 处理文件上传相关任务：创建客户端任务对象并入队，再异步上传
function handleNewTask(file: File) {
  // 简单校验文件类型
  if (!file.type.startsWith("video/")) {
    alert("仅支持视频文件");
    return;
  }

  const t: UploadTaskModel = {
    title: file.name,
    file,
    progress: 0,
    status: UploadStatus.Idle
  };

  // 草稿项目新增（显示在列表中）
  uploadTasks.value.push(t);
  // 选中新上传的草稿项目
  selectedIndex.value = uploadTasks.value.length - 1;

  // 异步开始上传（不阻塞 UI）
  uploadFile(t);
}
// 上传视频文件
async function uploadFile(t: UploadTaskModel) {
  const file = t.file;
  // 1. 判断文件大小（小于20MB直接上传，大于20MB分片上传）
  if (file.size < 20 * 1024 * 1024) {
    // 直接上传
    const url = await apiUpload(file, FileUploadTypeEnum.Video);
    t.status = UploadStatus.Done;
    t.remotePath = url;
    t.progress = 100;
  }else {
    // 大于20MB分片上传
    // 1. 构建 DTO
    const dto: InitUploadDto = {
      fileName: file.name,
      fileSize: file.size,
      fileMd5: SparkMD5.ArrayBuffer.hash(await file.arrayBuffer()),
      type: FileUploadTypeEnum.Video,
    };
    try {
      // 2. 调用 apiInitUpload 获取预签名等信息
      const vo = (await apiInitUpload(dto)) as InitUploadVO;
      if(vo.state === FileUploadStateEnum.Completed){
        // 文件已存在，直接标记完成
        t.status = UploadStatus.Done;
        t.progress = 100;
        t.remotePath = vo.path;
        return;
      }
      t.uploadId = vo.uploadId;
      t.status = UploadStatus.Uploading; // 上传中
      const partUrls = vo.partUrls || []; // 分片url列表
      const chunkSize = vo.chunkSize;
      // 3. 逐分片上传
      for (let i = 0; i < partUrls.length; i++) {
        // 3.1 截取文件分片
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const part = file.slice(start, end);
        const url = partUrls[i];
        // 3.2 上传分片到预签名 URL（PUT）
        const resp = await fetch(url, { method: "PUT", body: part });
        if (!resp.ok) throw new Error("上传分片失败:" + resp.status);
        // 3.3 更新进度
        t.progress = Math.floor(((i + 1) / partUrls.length) * 100);
      }
      // 4. 调用 apiFinishUpload 合并分片
      const finish = (await apiFinishUpload(t.uploadId!)) as FinishVO;
      t.status = UploadStatus.Done; // 上传完成
      t.progress = 100;
      t.remotePath = finish.path;
    } catch (err) {
      console.error(err);
      t.status = UploadStatus.Error; // 上传出错
    }
  }
}
// 选择封面图片
function onCoverChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files[0] || !selectedTask.value) return;
  const f = input.files[0];
  const url = URL.createObjectURL(f);
  coverPreview.value = url;
  (selectedTask.value as any).cover = f;
}
// 提交投稿
async function submitTask() {
  if (!selectedTask.value) return;
  // 这里可调用后端发布接口（尚未实现），当前仅打印信息
  console.log("提交投稿", selectedTask.value);
  alert("已提交（示例）");
}
</script>

<style scoped>
.upload-layout {
  width: 1100px;
  height: 100%;
  background-color: white;
  margin: 16px auto;
}

.upload-basic {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-header {
  height: 70px;
  font-size: 16px;
  font-weight: 600;
  line-height: 28px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 0 #e7e7e7;
}

.video-up {
  flex: 1;
}

.from {
  width: 360px;
}

.upload-drop {
  border: 2px dashed #dfe6ee;
  border-radius: 8px;
  height: 250px;
  margin: 20px 50px;
  display: flex;
  justify-content: center;
  background-color: #f9f9f9;
}

.upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-inner .hint {
  font-size: 14px;
  color: #888;
  margin-top: 8px;
}

.upload-icon {
  width: 120px;
  height: 93px;
  display: block;
}

.upload-btn {
  background: #00a1d6;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  width: 304px;
  text-align: center;
  line-height: 43px;
}

/* 覆盖层 input，让整个上传区域都可点击 */
.file-overlay-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 5;
}

.upload-drop {
  position: relative;
}

.visually-hidden {
  position: absolute;
  left: -9999px;
}

.upload-queue {
  border-radius: 8px;
  height: 250px;
  margin: 20px 50px;
  padding: 16px;
  background-color: #f9f9f9;
}

.task-list {
  height: 70px;
  display: flex;
}

.task-list-item {
  width: 218px;
  padding: 10px 6px 10px 12px;
  margin-right: 8px;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.task-title {
  font-size: 14px;
  line-height: 16px;
}

.add-btn {
  font-size: 12px;
  margin: 10px 0 20px 15px;
  padding: 3px 8px;
  color: #fff;
  background: #00a1d6;
  border: 1px solid #00a1d6;
  border-radius: 4px;
  cursor: pointer;
  display: inline;
}

.panel {
  background: #fff;
  padding: 12px;
  border-radius: 8px;
}

.cover-preview {
  width: 120px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
}

.form-actions {
  margin-top: 12px;
  text-align: right;
}

.form-actions button {
  padding: 8px 14px;
  background: #67aef5;
  color: #fff;
  border: none;
  border-radius: 6px;
}
</style>
