import axios, { type AxiosError } from "axios"

import { env } from "@/config/env"
import { storage } from "@/lib/storage"

export const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken()
  const activeOrganizationId = storage.getActiveOrganizationId()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (activeOrganizationId) {
    config.headers["X-Organization-Id"] = activeOrganizationId
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const requestUrl = error.config?.url ?? ""
    const isLoginEndpoint = requestUrl.includes("/auth/login")

    if (status === 401 && !isLoginEndpoint) {
      storage.removeToken()
      storage.removeActiveOrganizationId()

      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)
