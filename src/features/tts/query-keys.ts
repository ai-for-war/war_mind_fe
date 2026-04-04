import { getOrganizationQueryScope } from "@/lib/organization-query"

const TTS_QUERY_KEY = ["tts"] as const
const TTS_AUDIO_QUERY_KEY = [...TTS_QUERY_KEY, "audio"] as const

export const ttsQueryKeys = {
  all: TTS_QUERY_KEY,
  audioAll: TTS_AUDIO_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [...TTS_AUDIO_QUERY_KEY, "organization", getOrganizationQueryScope(organizationId)] as const,
  detail: (organizationId?: string | null, audioId?: string) =>
    [...ttsQueryKeys.scoped(organizationId), "detail", audioId] as const,
  list: (organizationId?: string | null, skip = 0, limit = 20) =>
    [...ttsQueryKeys.scoped(organizationId), "list", { skip, limit }] as const,
}
