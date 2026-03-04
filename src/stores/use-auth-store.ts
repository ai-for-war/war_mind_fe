import { create } from "zustand"

import type { UserResponse } from "@/features/auth/types/auth.types"
import { storage } from "@/lib/storage"

type AuthState = {
  token: string | null
  user: UserResponse | null
  isAuthenticated: boolean
  setAuth: (token: string, user: UserResponse) => void
  setUser: (user: UserResponse | null) => void
  logout: () => void
}

const initialToken = storage.getToken()

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: null,
  isAuthenticated: Boolean(initialToken),
  setAuth: (token, user) => {
    storage.setToken(token)
    set({
      token,
      user,
      isAuthenticated: true,
    })
  },
  setUser: (user) => {
    set({ user })
  },
  logout: () => {
    storage.removeToken()
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },
}))
