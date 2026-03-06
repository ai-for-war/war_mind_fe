import { useMutation, useQueryClient } from "@tanstack/react-query"

import { voicesApi } from "@/features/voice-cloning/api/voices-api"
import { voiceQueryKeys } from "@/features/voice-cloning/query-keys"

type CloneVoicePayload = {
  file: File
  name: string
  voiceId: string
}

export const useCloneVoice = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, name, voiceId }: CloneVoicePayload) =>
      voicesApi.cloneVoice(file, name, voiceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: voiceQueryKeys.all })
    },
  })
}
