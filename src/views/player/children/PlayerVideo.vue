<template>
  <div v-if="videoDetail">
    <h1>{{ videoDetail.title }}</h1>

    <div class="mock-player">视频播放器区域 (Aspect Ratio 16:9)
      <video controls :src="videoDetail.videoUrl"></video>

    </div>

    <p>{{ videoDetail.introduction }}</p>
  </div>
</template>
<script setup lang="ts">
import { apiGetVideoById } from "@/api/video"
import type { VideoDataDetailVO } from "@/types/video"

const route = useRoute()
const videoDetail = ref<VideoDataDetailVO | null>(null)

onMounted(async () => {
  const id = String(route.params.id)
  videoDetail.value = await apiGetVideoById(id)
})
</script>
<style scoped>
.mock-player {
  height: 485px;
  /* 约等于 862 * 9 / 16 */
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-bottom: 20px;
}
</style>
