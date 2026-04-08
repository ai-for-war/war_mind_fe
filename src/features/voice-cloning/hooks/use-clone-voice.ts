import { useMutation, useQueryClient } from "@tanstack/react-query"

import { voicesApi } from "@/features/voice-cloning/api/voices-api"
import { voiceQueryKeys } from "@/features/voice-cloning/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type CloneVoicePayload = {
  file: File
  name: string
  voiceId: string
}

export const useCloneVoice = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, name, voiceId }: CloneVoicePayload) =>
      voicesApi.cloneVoice(file, name, voiceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: voiceQueryKeys.scoped(activeOrganizationId),
      })
    },
  })
}
