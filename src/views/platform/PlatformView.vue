<template>
  <div class="layout">
    <!-- 顶部 Header -->
    <header class="header-bar">
      <div class="left">
        <div class="logo">Bibobibo&nbsp;&nbsp;创作中心</div>
        <a class="header-link" href="/">返回首页</a>
      </div>
      <div class="right">
        <div class="user">我的账号</div>
      </div>
    </header>

    <!-- 左侧导航 -->
    <aside class="sidebar">
      <ul>
        <li><router-link to="/platform/upload">投稿</router-link></li>
        <li>
          <router-link to="/platform/upload-manager">内容管理</router-link>
        </li>
        <li><router-link to="/platform/data">数据中心</router-link></li>
        <li><router-link to="/platform/comment">评论管理</router-link></li>
        <li><router-link to="/platform/danmaku">弹幕管理</router-link></li>
        <li><router-link to="/platform/allowance">收益管理</router-link></li>
      </ul>
    </aside>

    <!-- 主体 -->
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<style scoped>
.layout {
  height: 100vh;
  display: grid;
  grid-template-rows: 60px 1fr;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main";
}

/* Header */
.header-bar {
  grid-area: header;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 24px;
  box-sizing: border-box;

  background-color: #ffffff;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, .05);

  /* 顶部固定可选 */
  position: sticky;
  top: 0;
  z-index: 100;
}
.left {
  display: flex;
  align-items: center;
}
.left .header-link {
  margin-left: 16px;
  color: #333;
  text-decoration: none;
  cursor: pointer;
}
.right {
  margin-left: auto;
}
.logo {
  font-weight: 700;
  font-size: 18px;
  color: #00a0d6;
  margin-right: 18px;
}

/* 左侧导航 */
.sidebar {
  grid-area: sidebar;
  background: #fff;
  border-right: 1px solid #e6e6e6;
  padding-top: 24px;
}
.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar li {
  margin: 12px 0;
}
.sidebar a {
  text-decoration: none;
  padding: 10px 24px;
  display: block;
  color: #333;
}
.router-link-active {
  font-weight: bold;
  color: #00aaff;
}

/* 主体 */
.main {
  grid-area: main;
  background: #f5f5f7;
  display: flex;
}
</style>
