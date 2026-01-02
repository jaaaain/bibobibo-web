<template>
    <dev class="">个人空间
        <h1>用户主页：{{ route.params.id }}</h1>
    </dev>
</template>

<script setup lang="ts">
const route = useRoute()
</script>

<style scoped></style>