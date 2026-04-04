import { useQuery } from "@tanstack/react-query"

import { textToImageApi } from "@/features/text-to-image/api/text-to-image-api"
import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"
import type { GetImageGenerationHistoryParams } from "@/features/text-to-image/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useImageGenerationHistory = (
  params?: GetImageGenerationHistoryParams,
) => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    queryFn: () => textToImageApi.getImageGenerationHistory(params),
    queryKey: textToImageQueryKeys.history(activeOrganizationId, params),
  })
}
