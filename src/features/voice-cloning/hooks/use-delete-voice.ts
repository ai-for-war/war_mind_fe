import { useMutation, useQueryClient } from "@tanstack/react-query"

import { voicesApi } from "@/features/voice-cloning/api/voices-api"
import { voiceQueryKeys } from "@/features/voice-cloning/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useDeleteVoice = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (voiceId: string) => voicesApi.deleteVoice(voiceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: voiceQueryKeys.scoped(activeOrganizationId),
      })
    },
  })
}
