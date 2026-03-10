import { useMutation, useQueryClient } from "@tanstack/react-query"

import { textToImageApi } from "@/features/text-to-image/api/text-to-image-api"
import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"

export const useCancelImageGenerationJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => textToImageApi.cancelImageGenerationJob(jobId),
    mutationKey: textToImageQueryKeys.lifecycle(),
    onSuccess: (_, jobId) => {
      void queryClient.invalidateQueries({
        queryKey: textToImageQueryKeys.historyLists(),
      })
      void queryClient.invalidateQueries({
        queryKey: textToImageQueryKeys.detail(jobId),
      })
    },
  })
}
