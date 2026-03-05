import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useLocation, useNavigate } from "react-router-dom"

import { authApi } from "@/features/auth/api/auth-api"
import type { LoginRequest } from "@/features/auth/types/auth.types"
import { useAuthStore } from "@/stores/use-auth-store"
import { useOrganizationStore } from "@/stores/use-organization-store"

type LoginError = {
  message: string
}

type LocationState = {
  from?: string
}

const DEFAULT_ERROR_MESSAGE = "Invalid email or password"
const NO_ORGANIZATION_ERROR_MESSAGE =
  "Your account is not associated with any organization"
const FALLBACK_REDIRECT = "/"

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

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
  const logout = useAuthStore((state) => state.logout)
  const setOrganizations = useOrganizationStore(
    (state) => state.setOrganizations,
  )

  const mutation = useMutation({
    mutationFn: (payload: LoginRequest) => authApi.loginWithUser(payload),
    onSuccess: ({ token, user, organizations }) => {
      if (organizations.length === 0) {
        logout()
        throw new Error(NO_ORGANIZATION_ERROR_MESSAGE)
      }

      setAuth(token.access_token, user)
      setOrganizations(organizations)

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
