import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ttsApi } from "@/features/tts/api/tts-api"
import { ttsQueryKeys } from "@/features/tts/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useDeleteAudio = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (audioId: string) => ttsApi.deleteAudio(audioId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ttsQueryKeys.scoped(activeOrganizationId),
      })
    },
  })
}
