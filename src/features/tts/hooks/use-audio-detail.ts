import { useQuery } from "@tanstack/react-query"

import { ttsApi } from "@/features/tts/api/tts-api"
import { ttsQueryKeys } from "@/features/tts/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useAudioDetail = (audioId?: string) => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    enabled: Boolean(audioId?.trim()),
    queryFn: () => ttsApi.getAudio(audioId as string),
    queryKey: ttsQueryKeys.detail(activeOrganizationId, audioId),
  })
}
