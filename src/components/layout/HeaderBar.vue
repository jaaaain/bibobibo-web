<template>
  <div class="header-bar">
    <div class="left">
      <div class="logo">Bibobibo</div>
      <nav class="left-entry">
        <ul>
          <li><router-link style="color: #000;" to="/">首页</router-link></li>
          <li>番剧</li>
          <li>直播</li>
          <li>游戏中心</li>
          <li>会员购</li>
          <li>漫画</li>
          <li>赛事</li>
        </ul>
      </nav>
    </div>
    <div class="mid">
      <div class="search">
        <input type="search" placeholder="搜索视频、番剧、UP 主" />
      </div>
    </div>
    <div class="right">
      <nav class="right-entry">
        <ul>
          <li>
            <button v-if="!isLogin" @click="handleDialog()">登录</button>
            <button v-else @click="logout()">退出</button>
          </li>
          <li>大会员</li>
          <li>消息</li>
          <li>动态</li>
          <li>收藏</li>
          <li>历史</li>
          <li>创作中心</li>
          <li>
            <router-link class="header-upload-entry" to="/platform/upload">投稿</router-link>
          </li>
        </ul>
      </nav>
    </div>
  </div>
  <AuthModal v-model:dialogVisible="dialogVisible" />
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { apiGetUserSimple, apiLogout } from "@/api/user";
import { useUserStore } from "@/store";
import type { SelfCardVO } from "@/types/user";

// 使用 Pinia store 的响应式对象（不要把布尔值拷贝为普通变量）
const userStore = useUserStore();
const isLogin = computed(() => userStore.isLogin);

const user = ref<SelfCardVO | null>(null);
const dialogVisible = ref(false);

const getUserSimple = async () => {
  try {
    user.value = userStore.user;
  } catch (e) {
    console.error("获取用户信息失败", e);
  }
};

onMounted(async () => {
  if (isLogin.value) {
    await getUserSimple();
  }
});

const handleDialog = () => {
  dialogVisible.value = true;
};

const logout = async () => {
  console.log("logout");
  await apiLogout();
  userStore.logout();
};
</script>
<style scoped>
.header-bar {
  width: 100%;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 24px;
  box-sizing: border-box;

  background-color: #ffffff;
  border-bottom: 1px solid #e5e9ef;

  /* 顶部固定可选 */
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 左侧：Logo / 导航 */
.left {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.logo {
  font-weight: 700;
  font-size: 18px;
  color: #00a0d6;
  margin-right: 18px;
}

.left-entry ul {
  display: flex;
  gap: 14px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.left-entry li {
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

/* 中间：搜索 / 标题 */
.mid {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.search {
  width: 480px;
  max-width: 60%;
}
.search input {
  width: 100%;
  height: 36px;
  padding: 6px 12px;
  border-radius: 18px;
  border: 1px solid #e6e6e6;
  background: #fafafa;
  outline: none;
}
.search input::placeholder {
  color: #999;
}

/* 右侧：登录 / 用户信息 */
.right {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: flex-end;
}

.right-entry ul {
  display: flex;
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
  align-items: center;
}

.right-entry li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 14px;
}

/* 按钮统一风格 */
.right button {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;

  font-size: 14px;
  cursor: pointer;

  border: none;
  background-color: #00aeec;
  color: #fff;

  transition: background-color 0.2s;
}

.right button:hover {
  background-color: #0096cc;
}

.header-bar .header-upload-entry {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 16px;
    width: 90px;
    height: 34px;
    border-radius: 8px;
    background: #fb7299;
    color: #fff;
    text-align: center;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    transition: background-color .3s;
}

@media (max-width: 900px) {
  .search {
    width: 260px;
  }
  .left-entry ul {
    gap: 8px;
  }
  .right-entry ul {
    gap: 6px;
    font-size: 13px;
  }
}
</style>
