import { useQuery } from "@tanstack/react-query"

import { textToImageApi } from "@/features/text-to-image/api/text-to-image-api"
import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useImageGenerationDetail = (jobId: string | null) => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    enabled: Boolean(jobId),
    queryFn: () => {
      if (!jobId) {
        throw new Error("Job ID is required")
      }

      return textToImageApi.getImageGenerationDetail(jobId)
    },
    queryKey: textToImageQueryKeys.detail(
      activeOrganizationId,
      jobId ?? "unselected",
    ),
  })
}
