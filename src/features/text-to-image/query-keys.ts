import type { GetImageGenerationHistoryParams } from "@/features/text-to-image/types"

const DEFAULT_HISTORY_SKIP = 0
const DEFAULT_HISTORY_LIMIT = 20

export const textToImageQueryKeys = {
  all: ["text-to-image"] as const,
  historyLists: () => [...textToImageQueryKeys.all, "history"] as const,
  history: (params?: GetImageGenerationHistoryParams) =>
    [
      ...textToImageQueryKeys.historyLists(),
      params?.skip ?? DEFAULT_HISTORY_SKIP,
      params?.limit ?? DEFAULT_HISTORY_LIMIT,
    ] as const,
  details: () => [...textToImageQueryKeys.all, "detail"] as const,
  detail: (jobId: string) =>
    [...textToImageQueryKeys.details(), jobId] as const,
  lifecycle: () => [...textToImageQueryKeys.all, "lifecycle"] as const,
  lifecycleInvalidationTargets: (jobId?: string) =>
    jobId
      ? [
          textToImageQueryKeys.historyLists(),
          textToImageQueryKeys.detail(jobId),
        ]
      : [textToImageQueryKeys.historyLists()],
}
