<template>
  <header class="app-header">
    <HeaderBar />
  </header>

  <div class="app-main">
    <main class="left-container">
      <div class="player-wrapper">
        <router-view />
      </div>

      <div class="comment-section card">
        <CommentTree v-if="videoId" :vid="videoId" />
      </div>
    </main>

    <aside class="right-container">
      <div class="sticky-wrapper">
        <div class="author-card card">
          UP主信息
        </div>

        <div class="danmaku-list card">
          弹幕列表（可收起）
        </div>

        <div class="recommend-list card">
          <h3>推荐视频</h3>
          <div v-for="n in 20" :key="n" class="mock-rec">推荐视频 {{ n }}</div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import CommentTree from '@/components/features/comment/CommentTree.vue'

const route = useRoute()
const videoId = computed(() => Number(route.params.id))
</script>

<style scoped>
.app-main {
  align-items: flex-start;
  gap: 30px;
}

.left-container {
  width: 862px;
  flex-shrink: 0;
}

.right-container {
  width: 411px;
  min-width: 250px;
  flex-shrink: 0;
}

.sticky-wrapper {
  position: sticky;
  top: 20px;
}

.card {
  background: #fff;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #e3e5e7;
}

.comment-section {
  padding: 24px;
}

.mock-rec {
  height: 80px;
  background: #f1f2f3;
  margin-bottom: 10px;
  border-radius: 4px;
}
</style>
