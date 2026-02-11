<template>
  <div class="upload-layout">
    <div class="upload-basic">
      <!-- 上传区 / 任务条 -->
      <div class="video-up">
        <div class="upload-header">发布视频</div>
        <!-- 上传区 -->
        <div v-if="drafts.length === 0" class="upload-drop" @drop.prevent="onDrop" @dragover.prevent>
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
          <div class="draft-list">
            <div v-for="draft in drafts" :key="draft.draftData.id"
              :class="['draft-list-item', { selected: draft.draftData.id === selectedId }]"
              @click="selectDraft(draft.draftData.id)">
              <div class="draft-title">{{ draft.draftData.title }}</div>
            </div>
          </div>
          <button class="add-btn">添加分p</button>
          <!-- 上传文件列表, 目前不支持分p功能, 只有一条 uploadTask -->
          <div class="file-list">
            <div class="file-list-item">
              <div class="file-item-icon"></div>
              <div class="file-item-content">
                <div class="file-item-content-detail">
                  <div class="title">{{ selectedUploadTask.title }}</div>
                  <div class="status">上传完成</div>
                </div>
                <div class="file-item-content-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: (selectedUploadTask?.progress ?? 100) + '%' }"></div>
                  </div>
                  <div class="progress-text">{{ selectedUploadTask?.progress ?? 100 }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 基本设置 -->
      <div class="form" v-if="selectedId !== null">
        <div class="panel">
          <h3>基本设置</h3>

          <form @submit.prevent="publishVideo">
            <div class="form-row">
              <label>封面</label>
              <input type="file" accept="image/*" @change="onCoverChange" />
              <img v-if="editDraft.coverUrl" :src="editDraft.coverUrl" class="cover-preview" />
            </div>

            <div class="form-row">
              <label>标题</label>
              <input v-model="editDraft.title" placeholder="请输入视频标题" />
            </div>

            <div class="form-row">
              <label>简介</label>
              <textarea v-model="editDraft.introduction" rows="4" placeholder="视频简介（选填）"></textarea>
            </div>

            <div class="form-actions">
              <button type="button" @click="updateDraft">保存草稿</button>
              <button type="submit">提交投稿</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { apiGetMyDraftVideoList } from "@/api/platform";
import { apiCreateDraft, apiUpdateVideo, apiPublishVideo, apiDeleteVideo } from "@/api/video";
import type { DraftModel, DraftData } from "@/types/video";
import { useUploader } from "@/hooks/fileUploader";
import { FileUploadTypeEnum, UploadStatus, UploadTaskModel } from "@/types/file";
import { c } from "naive-ui";

// tasks 既显示已有草稿（Video）
const loading = ref<boolean>(false); // 加载状态
const drafts = ref<Array<DraftModel>>([]); // 当前用户的草稿列表
const selectedId = ref<string | null>(null); // 选中的草稿索引
const editDraft = ref<DraftData | null>(null)
const router = useRouter()
const message = useMessage()

// ===================== 草稿项目相关方法 =====================
// 获取草稿列表
const loadDrafts = async () => {
  loading.value = true
  try {
    const res = await apiGetMyDraftVideoList()
    drafts.value = res.map(item => ({
      draftData: item,
      uploadTask: {
        title: item.title,
        progress: ref(100),
        status: ref(UploadStatus.Done)
      }
    }))
    console.log("加载草稿列表", drafts.value)
    if (drafts.value.length > 0 && !selectedId.value) { // 有草稿且未选中任何草稿
      selectDraft(drafts.value[0].draftData.id);
    }
  } finally {
    loading.value = false
  }
}
onMounted(loadDrafts)
const selectedUploadTask = computed(() => drafts.value.find(d => d.draftData.id === selectedId.value)?.uploadTask ?? null)
// 选择草稿
function selectDraft(id: string) {
  console.log("选择草稿", id);
  selectedId.value = id;
  editDraft.value = drafts.value.find(d => d.draftData.id === id)?.draftData ?? null;
}
// 删除草稿
async function deleteDraft(id: string) {
  if (!confirm("确定要删除这个草稿吗？")) return;
  try {
    await apiDeleteVideo(id);
    if (selectedId.value === id) { // 删除了当前选中的草稿
      selectedId.value = null;
      editDraft.value = null;
    }
    await loadDrafts();
  } catch (err) {
    console.error('删除草稿失败', err);
  }
}
// 更新草稿
async function updateDraft() {
  if (!editDraft.value) return;
  try {
    await apiUpdateVideo(editDraft.value);
    message.success('保存草稿成功')
    // refresh list
    await loadDrafts()
  } catch (err) {
    console.error('保存草稿失败', err);
    message.error('保存草稿失败')
  }
}
// 发布/保存草稿
async function publishVideo() {
  if (!editDraft.value) return;

  try {
    await apiUpdateVideo(editDraft.value);
    await apiPublishVideo(editDraft.value.id);
    message.success('投稿已提交，正在审核')
    // 刷新草稿列表，然后跳到首页
    await loadDrafts();
    // 小延迟让用户看到提示后再跳转
    setTimeout(() => {
      router.push('/')
    }, 300)
  } catch (err) {
    console.error('投稿失败', err);
    message.error('投稿失败，请重试')
  }
}
// ===================== 文件上传相关方法 =====================
// 文件拖拽上传或点击上传触发
function onFileChange(e: Event) {
  console.log("文件选择事件触发");
  const input = e.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;
  handleNewUpload(input.files[0]);
}
function onDrop(e: DragEvent) {
  console.log("文件拖拽事件触发");
  if (!e.dataTransfer) return;
  const file = e.dataTransfer.files[0];
  if (file) handleNewUpload(file);
}
async function handleNewUpload(file: File) {
  console.log("处理新上传文件触发", file);
  // 上传新的文件
  const uploader = useUploader();
  // 1. 创建一个虚拟draft项，默认选中这个草稿，在这个草稿下有uploadTask
  const tempDraft = {
    draftData: {
      id: `temp-${Date.now()}`, // 临时id，后端返回后需要更新
      title: file.name,
    },
    uploadTask: {
      title: file.name,
      progress: uploader.progress,
      status: uploader.uploadStatus,
    }
  };
  console.log("已创建临时草稿项", tempDraft);
  drafts.value.push(tempDraft);
  selectDraft(tempDraft.draftData.id);
  // 2. 文件上传
  const uploadedPath = await uploader.upload(file, FileUploadTypeEnum.Video);
  // 2. apiCreateDraft
  try {
    const created = await apiCreateDraft(uploadedPath, file.name);
    console.log("创建草稿成功", created);
    // 后端返回草稿id后更新draftData.id
    tempDraft.draftData.id = created.id;
    selectDraft(tempDraft.draftData.id);
  } catch (err) {
    console.error('创建草稿失败', err);
  }
}

function onCoverChange() {

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

.draft-list {
  height: 70px;
  display: flex;
}

.draft-list-item {
  width: 218px;
  padding: 10px 6px 10px 12px;
  margin-right: 8px;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.draft-title {
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
