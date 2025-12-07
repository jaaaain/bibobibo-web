<template>
  <div>
    indexView
    <header>
      <RouterLink v-if="false" to="/login">登录</RouterLink>
      <div v-else>头像</div>
    </header>

    <main>
      <div v-for="v in list" :key="v.id">
        <RouterLink :to="`/video/${v.id}`">{{ v.title }}</RouterLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { apiGetVideoPage } from "@/api/video"
import type { Video } from "@/types/video"

const list = ref<Video[]>([])
const total = ref(0)

onMounted(async () => {
  const res = await apiGetVideoPage(1, 10)
  list.value = res.data.data.list
  total.value = res.data.data.total
})
</script>
<style scoped>  </style>