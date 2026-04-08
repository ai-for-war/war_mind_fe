import { getOrganizationQueryScope } from "@/lib/organization-query"

const VOICES_QUERY_KEY = ["voices"] as const

export const voiceQueryKeys = {
  all: VOICES_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [...VOICES_QUERY_KEY, "organization", getOrganizationQueryScope(organizationId)] as const,
  detail: (organizationId?: string | null, voiceId?: string) =>
    [...voiceQueryKeys.scoped(organizationId), "detail", voiceId] as const,
}
