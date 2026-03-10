export const TEXT_TO_IMAGE_ASPECT_RATIOS = [
  "1:1",
  "16:9",
  "4:3",
  "3:2",
  "2:3",
  "3:4",
  "9:16",
  "21:9",
] as const

export type TextToImageAspectRatio = (typeof TEXT_TO_IMAGE_ASPECT_RATIOS)[number]

export const IMAGE_GENERATION_JOB_STATUSES = [
  "pending",
  "processing",
  "succeeded",
  "failed",
  "cancelled",
] as const

export type ImageGenerationJobStatus = (typeof IMAGE_GENERATION_JOB_STATUSES)[number]

export interface CreateTextToImageJobRequest {
  prompt: string
  aspect_ratio: TextToImageAspectRatio
  seed?: number
  prompt_optimizer?: boolean
}

export interface CreateTextToImageJobResponse {
  job_id: string
  status: ImageGenerationJobStatus
}

export interface TextToImageGenerationJobRecord {
  id: string
  organization_id: string
  created_by: string
  type: string
  provider: string
  provider_model: string
  status: ImageGenerationJobStatus
  prompt: string
  aspect_ratio: TextToImageAspectRatio
  seed: number | null
  prompt_optimizer: boolean
  requested_count: number
  retry_count: number
  provider_trace_id: string | null
  output_image_ids: string[]
  success_count: number
  failed_count: number
  error_code: string | null
  error_message: string | null
  requested_at: string
  started_at: string | null
  completed_at: string | null
  cancelled_at: string | null
}

export interface ImageGenerationOutputImageAccess {
  image_id: string
  signed_url: string
}

export interface ImageGenerationJobDetailResponse {
  job: TextToImageGenerationJobRecord
  output_images: ImageGenerationOutputImageAccess[]
}

export interface ImageGenerationJobSummaryItem {
  id: string
  status: ImageGenerationJobStatus
  prompt: string
  aspect_ratio: TextToImageAspectRatio
  requested_at: string
  completed_at: string | null
  output_image_ids: string[]
  success_count: number
  failed_count: number
}

export interface ImageGenerationHistoryResponse {
  items: ImageGenerationJobSummaryItem[]
  total: number
  skip: number
  limit: number
}

export interface GetImageGenerationHistoryParams {
  skip?: number
  limit?: number
}

export interface CancelImageGenerationJobResponse {
  job_id: string
  status: ImageGenerationJobStatus
  cancelled_at: string
}

export interface ImageGenerationLifecycleEventPayload {
  job_id: string
  organization_id: string
  status: ImageGenerationJobStatus
  requested_count: number
  success_count: number
  failed_count: number
  image_ids: string[]
  error_message: string | null
}
