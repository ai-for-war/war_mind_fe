import { useQuery } from "@tanstack/react-query"

import { textToImageApi } from "@/features/text-to-image/api/text-to-image-api"
import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"
import type { GetImageGenerationHistoryParams } from "@/features/text-to-image/types"

export const useImageGenerationHistory = (
  params?: GetImageGenerationHistoryParams,
) => {
  return useQuery({
    queryFn: () => textToImageApi.getImageGenerationHistory(params),
    queryKey: textToImageQueryKeys.history(params),
  })
}
