import { useMutation, useQueryClient } from "@tanstack/react-query"

import { textToImageApi } from "@/features/text-to-image/api/text-to-image-api"
import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"
import type { CreateTextToImageJobRequest } from "@/features/text-to-image/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useCreateTextToImageJob = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTextToImageJobRequest) =>
      textToImageApi.createTextToImageJob(payload),
    mutationKey: textToImageQueryKeys.lifecycle(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: textToImageQueryKeys.historyLists(activeOrganizationId),
      })
    },
  })
}
