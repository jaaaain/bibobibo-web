import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import('@/views/index/IndexView.vue') },
    { path: "/login", component: () => import('@/views/LoginView.vue') },

    // 消息中心
    {
      path: '/message',
      component: () => import('@/views/message/MessageView.vue'),
      children: [
        { path: 'at', component: () => import('@/views/message/children/MessageAt.vue') },
        { path: 'config', component: () => import('@/views/message/children/MessageConfig.vue') },
        { path: 'love', component: () => import('@/views/message/children/MessageLove.vue') },
        { path: 'reply', component: () => import('@/views/message/children/MessageReply.vue') },
        { path: 'system', component: () => import('@/views/message/children/MessageSystem.vue') },
        { path: 'whisper', component: () => import('@/views/message/children/MessageWhisper.vue') }
      ]
    },

    // 创作中心
    {
      path: '/platform',
      component: () => import('@/views/platform/PlatformView.vue'),
      children: [
        { path: 'allowance', component: () => import('@/views/platform/children/PlatformAllowance.vue') },
        { path: 'comment', component: () => import('@/views/platform/children/PlatformComment.vue') },
        { path: 'danmaku', component: () => import('@/views/platform/children/PlatformDanmaku.vue') },
        { path: 'data', component: () => import('@/views/platform/children/PlatformData.vue') },
        { path: 'upload', component: () => import('@/views/platform/children/PlatformUpload.vue') },
        { path: 'upload-manager', component: () => import('@/views/platform/children/PlatformUploadManager.vue') }
      ]
    },

    // 视频播放
    {
      path: '/player',
      component: () => import('@/views/player/PlayerView.vue'),
      children: [
        { path: 'bangumi/:id', component: () => import('@/views/player/children/PlayerBangumi.vue') },
        { path: 'video/:id', component: () => import('@/views/player/children/PlayerVideo.vue') }
      ]
    },

    // 搜索
    {
      path: '/search',
      component: () => import('@/views/search/SearchView.vue'),
      children: [
        { path: 'all', component: () => import('@/views/search/children/SearchAll.vue') },
        { path: 'article', component: () => import('@/views/search/children/SearchArticle.vue') },
        { path: 'bangumi', component: () => import('@/views/search/children/SearchBangumi.vue') },
        { path: 'live', component: () => import('@/views/search/children/SearchLive.vue') },
        { path: 'pgc', component: () => import('@/views/search/children/SearchPgc.vue') },
        { path: 'upuser', component: () => import('@/views/search/children/SearchUpuser.vue') },
        { path: 'video', component: () => import('@/views/search/children/SearchVideo.vue') }
      ]
    },

    // 设置
    {
      path: '/settings',
      component: () => import('@/views/settings/SettingView.vue'),
      children: [
        { path: 'account', component: () => import('@/views/settings/children/SettingAccount.vue') },
        { path: 'language', component: () => import('@/views/settings/children/SettingLanguage.vue') },
        { path: 'message', component: () => import('@/views/settings/children/SettingMessage.vue') },
        { path: 'security', component: () => import('@/views/settings/children/SettingSecurity.vue') }
      ]
    },

    // 个人空间
    {
      path: '/space',
      component: () => import('@/views/space/SpaceView.vue'),
      children: [
        { path: 'dynamic', component: () => import('@/views/space/children/SpaceDynamic.vue') },
        { path: 'fans', component: () => import('@/views/space/children/SpaceFans.vue') },
        { path: 'favlist', component: () => import('@/views/space/children/SpaceFavlist.vue') },
        { path: 'follow', component: () => import('@/views/space/children/SpaceFollow.vue') },
        { path: 'home', component: () => import('@/views/space/children/SpaceHome.vue') },
        { path: 'lists', component: () => import('@/views/space/children/SpaceLists.vue') },
        { path: 'settings', component: () => import('@/views/space/children/SpaceSettings.vue') },
        { path: 'upload', component: () => import('@/views/space/children/SpaceUpload.vue') }
      ]
    }
  ]
})

export default router
