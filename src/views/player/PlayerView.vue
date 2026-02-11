<template>
  <div class="video-page-container">
    <header class="app-header">
      <HeaderBar />
    </header>

    <div class="main-layout">
      
      <main class="left-container">
        <div class="video-player-wrapper">
          <router-view />
        </div>

        <div class="comment-section card">
          <h3>评论区</h3>
          <div v-for="n in 10" :key="n" class="mock-comment">评论内容 {{ n }}...</div>
        </div>
      </main>

      <aside class="right-container">
        <div class="sticky-wrapper">
          <div class="author-card card">
            UP主信息
          </div>
          
          <div class="danmaku-list card">
            弹幕列表 (可收起)
          </div>

          <div class="recommend-list card">
            <h3>推荐视频</h3>
            <div v-for="n in 20" :key="n" class="mock-rec">推荐视频 {{ n }}</div>
          </div>
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts"> 
</script>

<style scoped>
/* 1. 页面整体容器 */
.video-page-container {
  min-height: 100vh;
  background-color: #f4f5f7; /* B站常用背景色 */
}

/* 3. 核心布局容器 */
.main-layout {
  /* 核心逻辑：Flex布局 */
  display: flex;
  justify-content: center; /* 内容居中 */
  align-items: flex-start; /* 关键：顶部对齐，防止子元素默认拉伸高度，这对 sticky 很重要 */
  
  /* 宽度计算：862 + 350 + 30 = 1242px */
  width: 1242px; 
  margin: 20px auto; /* 上下留白，左右居中 */
  gap: 30px; /* 替代 margin-left，Flex gap 更现代 */
}

/* 4. 左侧区域 */
.left-container {
  width: 862px;
  /* 防止被挤压 */
  flex-shrink: 0; 
}

/* 5. 右侧区域 */
.right-container {
  width: 350px;
  flex-shrink: 0;
}

/* 6. 核心功能：右侧粘性滚动 (Sticky Sidebar) */
/* 原理：当页面滚动时，.sticky-wrapper 会相对于 .right-container 移动，
   配合 main-layout 的 align-items: flex-start，
   可以让右侧内容在滚动时吸附在顶部。
*/
.sticky-wrapper {
  position: sticky;
  top: 20px; /* 距离顶部的吸附距离，如果有 fixed header，这里要加上 header 高度 */
}

/* --- 以下仅为视觉模拟样式，开发时可删除 --- */
.card {
  background: #fff;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #e3e5e7;
}

.mock-comment {
  height: 60px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.mock-rec {
  height: 80px;
  background: #f1f2f3;
  margin-bottom: 10px;
  border-radius: 4px;
}
</style>