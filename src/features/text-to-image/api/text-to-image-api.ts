import { apiClient } from "@/lib/api-client"

import type {
  CancelImageGenerationJobResponse,
  CreateTextToImageJobRequest,
  CreateTextToImageJobResponse,
  GetImageGenerationHistoryParams,
  ImageGenerationHistoryResponse,
  ImageGenerationJobDetailResponse,
} from "@/features/text-to-image/types"

const DEFAULT_HISTORY_SKIP = 0
const DEFAULT_HISTORY_LIMIT = 20

const createTextToImageJob = async (
  payload: CreateTextToImageJobRequest,
): Promise<CreateTextToImageJobResponse> => {
  const response = await apiClient.post<CreateTextToImageJobResponse>(
    "/image-generations/text-to-image",
    payload,
  )
  return response.data
}

const getImageGenerationHistory = async (
  params?: GetImageGenerationHistoryParams,
): Promise<ImageGenerationHistoryResponse> => {
  const response = await apiClient.get<ImageGenerationHistoryResponse>(
    "/image-generations",
    {
      params: {
        skip: params?.skip ?? DEFAULT_HISTORY_SKIP,
        limit: params?.limit ?? DEFAULT_HISTORY_LIMIT,
      },
    },
  )
  return response.data
}

const getImageGenerationDetail = async (
  jobId: string,
): Promise<ImageGenerationJobDetailResponse> => {
  const response = await apiClient.get<ImageGenerationJobDetailResponse>(
    `/image-generations/${jobId}`,
  )
  return response.data
}

const cancelImageGenerationJob = async (
  jobId: string,
): Promise<CancelImageGenerationJobResponse> => {
  const response = await apiClient.post<CancelImageGenerationJobResponse>(
    `/image-generations/${jobId}/cancel`,
  )
  return response.data
}

export const textToImageApi = {
  createTextToImageJob,
  getImageGenerationHistory,
  getImageGenerationDetail,
  cancelImageGenerationJob,
}
