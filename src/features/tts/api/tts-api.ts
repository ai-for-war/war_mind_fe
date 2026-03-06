import { apiClient } from "@/lib/api-client"

import type {
  AudioDetailResponse,
  AudioListResponse,
  GenerateAudioRequest,
  GenerateAudioResponse,
} from "@/features/tts/types/tts.types"

const generateAudio = async (
  request: GenerateAudioRequest,
): Promise<GenerateAudioResponse> => {
  const response = await apiClient.post<GenerateAudioResponse>(
    "/tts/generate",
    request,
  )
  return response.data
}

const listAudio = async (
  skip = 0,
  limit = 20,
): Promise<AudioListResponse> => {
  const response = await apiClient.get<AudioListResponse>("/tts/audio", {
    params: {
      limit,
      skip,
    },
  })
  return response.data
}

const getAudio = async (audioId: string): Promise<AudioDetailResponse> => {
  const response = await apiClient.get<AudioDetailResponse>(`/tts/audio/${audioId}`)
  return response.data
}

const deleteAudio = async (audioId: string): Promise<void> => {
  await apiClient.delete(`/tts/audio/${audioId}`)
}

export const ttsApi = {
  generateAudio,
  listAudio,
  getAudio,
  deleteAudio,
}
