import { createRouter, createWebHistory } from 'vue-router'
const Index = () => import('@views/indexView.vue')

const routes = [
    { path: '/', redirect: '' },
    { path: '', name: "index", component: Index, meta: { requestAuth: false } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router