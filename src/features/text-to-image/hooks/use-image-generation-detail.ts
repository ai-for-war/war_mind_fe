import { useQuery } from "@tanstack/react-query"

import { textToImageApi } from "@/features/text-to-image/api/text-to-image-api"
import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"

export const useImageGenerationDetail = (jobId: string | null) => {
  return useQuery({
    enabled: Boolean(jobId),
    queryFn: () => {
      if (!jobId) {
        throw new Error("Job ID is required")
      }

      return textToImageApi.getImageGenerationDetail(jobId)
    },
    queryKey: textToImageQueryKeys.detail(jobId ?? "unselected"),
  })
}
