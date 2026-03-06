import { useMutation, useQueryClient } from "@tanstack/react-query"

import { ttsApi } from "@/features/tts/api/tts-api"
import { ttsQueryKeys } from "@/features/tts/query-keys"

export const useDeleteAudio = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (audioId: string) => ttsApi.deleteAudio(audioId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ttsQueryKeys.audioAll })
    },
  })
}
