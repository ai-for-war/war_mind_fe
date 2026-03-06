import { apiClient } from "@/lib/api-client"

import type {
  CloneVoiceResponse,
  VoiceDetailResponse,
  VoiceListResponse,
} from "@/features/voice-cloning/types/voice.types"

const listVoices = async (): Promise<VoiceListResponse> => {
  const response = await apiClient.get<VoiceListResponse>("/voices")
  return response.data
}

const getVoice = async (voiceId: string): Promise<VoiceDetailResponse> => {
  const response = await apiClient.get<VoiceDetailResponse>(`/voices/${voiceId}`)
  return response.data
}

const cloneVoice = async (
  file: File,
  name: string,
  voiceId: string,
): Promise<CloneVoiceResponse> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("name", name)
  formData.append("voice_id", voiceId)

  const response = await apiClient.post<CloneVoiceResponse>("/voices/clone", formData)
  return response.data
}

const deleteVoice = async (voiceId: string): Promise<void> => {
  await apiClient.delete(`/voices/${voiceId}`)
}

export const voicesApi = {
  listVoices,
  getVoice,
  cloneVoice,
  deleteVoice,
}
