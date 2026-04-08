import { useQuery } from "@tanstack/react-query"

import { voicesApi } from "@/features/voice-cloning/api/voices-api"
import { voiceQueryKeys } from "@/features/voice-cloning/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useVoiceDetail = (voiceId?: string) => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    enabled: Boolean(voiceId?.trim()),
    queryFn: () => voicesApi.getVoice(voiceId as string),
    queryKey: voiceQueryKeys.detail(activeOrganizationId, voiceId),
  })
}
