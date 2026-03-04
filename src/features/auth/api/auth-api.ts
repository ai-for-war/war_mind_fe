import { apiClient } from "@/lib/api-client"
import { storage } from "@/lib/storage"

import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  TokenResponse,
  UserResponse,
} from "@/features/auth/types/auth.types"

const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>("/auth/login", data)
  return response.data
}

const getMe = async (): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>("/users/me")
  return response.data
}

const changePassword = async (
  data: ChangePasswordRequest,
): Promise<ChangePasswordResponse> => {
  const response = await apiClient.post<ChangePasswordResponse>(
    "/auth/change-password",
    data,
  )
  return response.data
}

const loginWithUser = async (
  data: LoginRequest,
): Promise<{ token: TokenResponse; user: UserResponse }> => {
  const token = await login(data)
  storage.setToken(token.access_token)

  try {
    const user = await getMe()
    return { token, user }
  } catch (error) {
    storage.removeToken()
    throw error
  }
}

export const authApi = {
  login,
  getMe,
  changePassword,
  loginWithUser,
}
