<template>
  <div v-if="videoDetail">
    <div class="video-info">
      <div class="video-title">
        <h1>{{ videoDetail.title }}</h1>
      </div>
      <div class="video-meta">
        <div class="meta-item">
          {{ videoDetail.statVO.play }} 播放
        </div>
        <div class="meta-item">
          {{ videoDetail.statVO.danmaku }} 弹幕
        </div>
        <div class="meta-item">
          {{ videoDetail.releaseTime }}
        </div>
      </div>
    </div>
    <div class="player-placeholder">
      <div class="player-placeholder-top">
        <video ref="videoRef" class="player" controls :src="videoDetail.videoUrl"></video>
        <DanmakuLayer
      ref="dmLayerRef"
      :video="videoRef"
      :dmList="dmList"
      :enabled="dmEnabled"
    />
      </div>
      <div class="player-placeholder-bottom">
        <div class="player-placeholder-bottom-left">
          {{ viewerCount }} 人正在看，已装填 {{ dmList.length }} 条弹幕
        </div>
        <div class="player-placeholder-bottom-right">
          <div class="dm-switch">
            <n-switch v-model="dmEnabled" size="small" />
          </div>
          <div class="dm-setting">
            <n-button size="tiny">
              设置
            </n-button>

          </div>
          <div class="dm-input-container">
            <n-input v-model:value="dmText" placeholder="发一条弹幕吧~" size="small" class="dm-input" @keyup.enter="sendDm" />

            <n-button class="dm-send-btn" type="primary" size="small" @click="sendDm">
              发送
            </n-button>
          </div>
        </div>
      </div>
    </div>

    <div class="toolbar-container">
      <el-button type="primary" size="small">点赞 {{ videoDetail.statVO.like }}</el-button>
      <el-button type="danger" size="small">投币 {{ videoDetail.statVO.coin }}</el-button>
      <el-button type="success" size="small">收藏 {{ videoDetail.statVO.favorite }}</el-button>
    </div>

        <div class="video-desc">

      <div ref="descRef" class="desc-content" :class="{ collapsed: isCollapsed }">
        {{ videoDetail.introduction }}
      </div>

      <div v-if="showToggle" class="toggle-btn" @click="toggle">
        {{ isCollapsed ? '展开' : '收起' }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import DanmakuLayer from './DanmakuLayer.vue'
import { apiGetListDanmaku, connectDanmaku, joinVideo, leaveVideo, onDanmaku, onViewerCount, sendDanmaku } from "@/api/danmaku"
import { apiGetVideoById } from "@/api/video"
import { useUserStore } from "@/store"
import { Danmaku } from "@/types/danmaku"
import type { VideoDataDetailVO } from "@/types/video"
import { wsClient } from '@/utils/websocket'

const route = useRoute()
const videoDetail = ref<VideoDataDetailVO | null>(null)
const videoId = computed(() => Number(route.params.id))
const dmList = ref<Danmaku[]>([])
const viewerCount = ref(0)

const videoRef = ref<HTMLVideoElement | null>(null)
const dmLayerRef = ref<{ renderRealtime?: (dm: Danmaku) => void } | null>(null)

// 保存回调引用以便卸载时取消订阅
let danmakuHandler: ((d: Danmaku) => void) | null = null
let viewerHandler: ((n: number) => void) | null = null

onMounted(async () => {
  console.log('用户 ID:', useUserStore().user?.id, '进入视频页面，视频 ID:', videoId.value)
  const vid = videoId.value
  if (!vid) return
  try {
    // 建立 ws 连接
    await connectDanmaku()

    // 注册消息回调，并保存引用以便 later off
    danmakuHandler = (danmaku: Danmaku) => {
      console.log('收到弹幕', danmaku)
      // 把新弹幕插入到有序列表中（保证 dmList 有序）
      insertDanmaku(dmList.value, danmaku)
      // 通过子组件的 ref 调用 renderRealtime 立即显示
      dmLayerRef.value?.renderRealtime(danmaku)
    }
    onDanmaku(danmakuHandler)

    viewerHandler = (count: number) => {
      console.log('当前观看人数', count)
      viewerCount.value = count
    }
    onViewerCount(viewerHandler)

    // 加入视频房间
    await joinVideo(vid)

    // 并行获取视频详情与弹幕列表
    const [video, danmakus] = await Promise.all([
      apiGetVideoById(vid),
      apiGetListDanmaku(vid)
    ])
    videoDetail.value = video
    // 保证 dmList 有序
    dmList.value = danmakus.sort((a, b) => a.timePoint - b.timePoint)
  } catch (err) {
    console.error('初始化失败', err)
  }
})

onBeforeUnmount(() => {
  // 组件卸载时：离开房间并取消 ws 订阅，防止内存泄漏
  try {
    const vid = videoId.value
    if (vid) leaveVideo(vid)
  } catch (e) {
    // ignore
  }
  if (danmakuHandler) wsClient.off('danmaku', danmakuHandler)
  if (viewerHandler) wsClient.off('viewerCount', viewerHandler)
})

const dmEnabled = ref(true) // todo 添加到store
const dmText = ref('')

const sendDm = async () => {
  // 如果输入框为空，或弹幕功能未开启，则不发送
  if (!dmText.value.trim() || !dmEnabled.value) {
    console.log('输入框为空，或弹幕功能未开启')
    return
  }

  const now = videoRef.value ? Number(videoRef.value.currentTime) : 0
  const newDm: Danmaku = {
    vid: videoId.value!,
    uid: useUserStore().user?.id || 0,
    timePoint: now,
    mode: 1, // 滚动
    state: 0,
    content: dmText.value,
    color: '#FFFFFF',
    fontSize: 25
  }

  console.log('用户 ID:', useUserStore().user?.id, '发送弹幕:', newDm)
  try {
    // 先做本地展示（插入有序列表并立即渲染），再调用接口。
    insertDanmaku(dmList.value, newDm as Danmaku)

  await sendDanmaku(videoId.value!, newDm)
  } catch (e) {
    console.error('发送弹幕失败', e)
  }

  dmText.value = ''
}

// 简单的简介展开/收起逻辑
const isCollapsed = ref(true)
const descRef = ref<HTMLElement | null>(null)
const showToggle = computed(() => {
  if (!descRef.value) return false
  return descRef.value.scrollHeight > 84 // 84px 是初始高度
})
const toggle = () => {
  isCollapsed.value = !isCollapsed.value
}

function insertDanmaku(list: Danmaku[], danmaku: Danmaku) {
  let left = 0
  let right = list.length

  while (left < right) {
    const mid = (left + right) >> 1
    if (list[mid].timePoint <= danmaku.timePoint) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  list.splice(left, 0, danmaku)
}

</script>
<style scoped>
.video-info {
  position: relative;
  height: 84px;
}

.video-info .video-title {
  display: block;
}

.video-info .video-title h1 {
  display: flex;
  font-size: 22px;
  font-weight: 500;
  line-height: 30px;
  margin: 0;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
}

.video-info .video-meta {
  display: flex;
  margin-top: 10px;
  height: 24px;
}

.video-info .video-meta .meta-item {
  align-items: center;
  margin-right: 20px;
  font-size: 13px;
  color: #9499A0;
}

.player-placeholder {
  display: flex;
  flex-direction: column;
  border: #F1F2F3 solid 1px;
  box-shadow: 0 0 8px #F1F2F3;
}

.player-placeholder-top {
  height: 485px;
  position: relative; /* 确保弹幕层使用此容器作为定位上下文，避免弹幕超出视频区域 */
  /* 约等于 862 * 9 / 16 */
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-placeholder-bottom {
  /* position: relative; */
  display: flex;
  justify-content: space-between;
  height: 56px;
  align-items: center;
  padding: 0 12px;
}

.player-placeholder-bottom-left {
  font-size: 13px;
  /* 字间隙设置 */
  letter-spacing: 1.0px;
  line-height: 56px;
  color: #222;
  align-items: center;
  margin-right: 28px;
  width: auto;
}

.player-placeholder-bottom-right {
  display: flex;
  flex: auto;
  align-items: center;
}

.dm-switch,
.dm-setting {
  display: flex;
  height: 34px;
  margin-right: 18px;
  align-items: center;
  width: 34px;
}

.dm-input-container {
  display: flex;
  border-radius: 8px;
  height: 42px;
  min-width: 300px;
  width: calc(100% - 72px);
}

.dm-input {
  background-color: #F1F2F3;
  display: flex;
  border: none;
  border-radius: 8px 0 0 8px;
  height: 100%;
  min-width: 200px;
  text-align: left;
  padding-left: 12px;
  padding-right: 12px;
}

.dm-send-btn {
  display: flex;
  border-radius: 0 8px 8px 0;
  height: 100%;
  min-width: 62px;
  width: 62px;
  background-color: #00aeec;
  border: none;
}

.toolbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  padding-bottom: 12px;
  height: 34px;
  /* line-height: 28px; */
  border-bottom: 1px solid #E3E5E7;
}

.video-desc {
  margin: 16px 0;
  height: auto;
  white-space: pre-line;
  color: #222;
  font-size: 15px;
  line-height: 24px;
  overflow: hidden;
  word-break: break-all;
  line-break: anywhere;
  text-align: left;
}


.desc-content {
  transition: all 0.3s;
  white-space: pre-line;
  word-break: break-all;
}

.desc-content.collapsed {
  max-height: 84px;
  overflow: hidden;
}

.toggle-btn {
  margin-top: 6px;
  font-size: 14px;
  color: #9499A0;
  cursor: pointer;
  user-select: none;
}

.card {
  padding: 0px;
}
</style>
