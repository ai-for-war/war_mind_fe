import { useQuery } from "@tanstack/react-query"

import { ttsApi } from "@/features/tts/api/tts-api"
import { ttsQueryKeys } from "@/features/tts/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useAudioList = (skip = 0, limit = 20) => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    queryFn: () => ttsApi.listAudio(skip, limit),
    queryKey: ttsQueryKeys.list(activeOrganizationId, skip, limit),
  })
}
