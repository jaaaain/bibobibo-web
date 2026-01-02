import { defineStore } from 'pinia'
import type { SelfCardVO } from '@/types/user'
import { apiGetUserSimple } from '@/api/user'
import type { UploadStatus } from '@/types/file'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    user: null as SelfCardVO | null
  }),

  actions: {
    setUser(u: SelfCardVO) {
      this.user = u
      this.isLogin = true
    },

    async init() {
      const token = localStorage.getItem("token");
      console.log("Initializing user store, token:", token);
      if (!token) return;

      this.isLogin = true;

      try {
        const userSimple = await apiGetUserSimple();
        this.user = userSimple;
      } catch {
        // token 失效
        this.logout();
      }
    },

    logout() {
      this.isLogin = false;
      this.user = null;
      localStorage.removeItem("token");
    },
  }
})

export const useUploadStore = defineStore('upload', {
  state: () => ({
    uploadId: '',
    file: null as File | null,
    progress: 0,
    status: 'idle' as UploadStatus,
    uploadedParts: new Set<number>(),
  }),
  actions: {
    setUploadProgress(progress: number) {
      this.uploadProgress = progress
    }
  }
})
