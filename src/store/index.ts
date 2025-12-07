import { defineStore } from 'pinia'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    user: null as User | null
  }),

  actions: {
    setUser(u: User) {
      this.user = u
      this.isLogin = true
    },

    logout() {
      this.user = null
      this.isLogin = false
    }
  }
})
