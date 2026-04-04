import type { GetImageGenerationHistoryParams } from "@/features/text-to-image/types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const DEFAULT_HISTORY_SKIP = 0
const DEFAULT_HISTORY_LIMIT = 20

export const textToImageQueryKeys = {
  all: ["text-to-image"] as const,
  scoped: (organizationId?: string | null) =>
    [...textToImageQueryKeys.all, "organization", getOrganizationQueryScope(organizationId)] as const,
  historyLists: (organizationId?: string | null) =>
    [...textToImageQueryKeys.scoped(organizationId), "history"] as const,
  history: (
    organizationId?: string | null,
    params?: GetImageGenerationHistoryParams,
  ) =>
    [
      ...textToImageQueryKeys.historyLists(organizationId),
      params?.skip ?? DEFAULT_HISTORY_SKIP,
      params?.limit ?? DEFAULT_HISTORY_LIMIT,
    ] as const,
  details: (organizationId?: string | null) =>
    [...textToImageQueryKeys.scoped(organizationId), "detail"] as const,
  detail: (organizationId: string | null | undefined, jobId: string) =>
    [...textToImageQueryKeys.details(organizationId), jobId] as const,
  lifecycle: () => [...textToImageQueryKeys.all, "lifecycle"] as const,
  lifecycleInvalidationTargets: (
    organizationId?: string | null,
    jobId?: string,
  ) =>
    jobId
      ? [
          textToImageQueryKeys.historyLists(organizationId),
          textToImageQueryKeys.detail(organizationId, jobId),
        ]
      : [textToImageQueryKeys.historyLists(organizationId)],
}
