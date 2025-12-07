import { createRouter, createWebHistory } from "vue-router"

const Index = () => import("@/views/indexView.vue")
const VideoDetail = () => import("@/views/videoDetailView.vue")
const Login = () => import("@/views/loginView.vue")
const UserHome = () => import("@/views/userHomeView.vue")


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Index },
    { path: "/video/:id", component: VideoDetail },
    { path: "/login", component: Login },
    { path: "/user/:id", component: UserHome },
  ]
})
console.log("Login route = ", Login)
export default router
