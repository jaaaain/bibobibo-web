<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import { apiGetVideoById } from "@/api/video"
import type { Video } from "@/types/video"

const route = useRoute()
const video = ref<Video | null>(null)

onMounted(async () => {
  const id = Number(route.params.id)
  const res = await apiGetVideoById(id)
  video.value = res.data.data
})
</script>

<template>
  <div v-if="video">
    <h1>{{ video.title }}</h1>
    <video controls :src="video.videoUrl"></video>
    <p>{{ video.introduction }}</p>
  </div>
</template>
