import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ttsApi } from "@/features/tts/api/tts-api"
import { ttsQueryKeys } from "@/features/tts/query-keys"
import type { GenerateAudioRequest } from "@/features/tts/types/tts.types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useGenerateAudio = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateAudioRequest) => ttsApi.generateAudio(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ttsQueryKeys.scoped(activeOrganizationId),
      })
    },
  })
}
