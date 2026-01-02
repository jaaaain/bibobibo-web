<template>
  <div class="layout">
    <header class="app-header">
      <HeaderBar />
    </header>

    <main class="app-main">
      <div v-for="v in list" :key="v.id" class="video-card">
        <RouterLink :to="`/video/${v.id}`">{{ v.title }}</RouterLink>
      </div>
    </main>
  </div>
</template>


<script setup lang="ts">
import { apiGetVideoPage } from "@/api/video"
import type { Video } from "@/types/video"

const list = ref<Video[]>([])
const total = ref(0)
onMounted(async () => {
  const res = await apiGetVideoPage(1, 10)
  list.value = res.list
  total.value = res.total
})
</script>
<style scoped>
.layout {
  box-sizing: border-box;
  min-height: 100vh;
  width: 100%; /* 使用 100% 避免 100vw 带来的水平滚动问题（包含滚动条宽度） */
  margin: 0;
  padding: 0;
}

.app-header {
  width: 100%;
  position: sticky;   /* 粘性头部 */
  top: 0;
  z-index: 1000;
  background: var(--el-color-white, #fff);
  /* 可选：添加轻微阴影以区分主内容 */
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.app-main {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* 列表项在全宽下更整齐排列 */
.app-main > div {
  max-width: 1200px; /* 可选：限制内容最大宽度，去掉则完全铺满 */
  margin: 0 auto;
}

/* 视频条目样式示例：响应式网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.video-card {
  padding: 8px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

</style>
