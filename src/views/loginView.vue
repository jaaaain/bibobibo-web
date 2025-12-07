<template>
  <div class="login-container">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>

    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiLogin } from '@/api/user'
import router from '@/router'

const username = ref('')
const password = ref('')
const message = ref('')

const handleLogin = async () => {
  const res = await apiLogin(username.value, password.value)
  message.value = res.data
  router.push('/')
}
</script>

<style>
.login-container {
  width: 300px;
  margin: 50px auto;
}
</style>
