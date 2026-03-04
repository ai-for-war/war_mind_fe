import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useLocation, useNavigate } from "react-router-dom"

import { authApi } from "@/features/auth/api/auth-api"
import type { LoginRequest } from "@/features/auth/types/auth.types"
import { useAuthStore } from "@/stores/use-auth-store"

type LoginError = {
  message: string
}

type LocationState = {
  from?: string
}

const DEFAULT_ERROR_MESSAGE = "Invalid email or password"
const FALLBACK_REDIRECT = "/"

const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === "string" && data.trim().length > 0) {
      return data
    }

    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    ) {
      return data.message
    }
  }

  return DEFAULT_ERROR_MESSAGE
}

export const useLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)

  const mutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.loginWithUser(payload),
    onSuccess: ({ token, user }) => {
      setAuth(token.access_token, user)

      const locationState = location.state as LocationState | null
      const redirectPath = locationState?.from ?? FALLBACK_REDIRECT
      navigate(redirectPath, { replace: true })
    },
  })

  return {
    clearError: mutation.reset,
    error: mutation.error
      ? ({ message: getErrorMessage(mutation.error) } satisfies LoginError)
      : null,
    isPending: mutation.isPending,
    login: mutation.mutateAsync,
  }
}
