import { useQuery } from "@tanstack/react-query"

import { ttsApi } from "@/features/tts/api/tts-api"
import { ttsQueryKeys } from "@/features/tts/query-keys"

export const useAudioDetail = (audioId?: string) =>
  useQuery({
    enabled: Boolean(audioId?.trim()),
    queryFn: () => ttsApi.getAudio(audioId as string),
    queryKey: ttsQueryKeys.detail(audioId),
  })
