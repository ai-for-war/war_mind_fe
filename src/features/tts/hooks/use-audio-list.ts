import { useQuery } from "@tanstack/react-query"

import { ttsApi } from "@/features/tts/api/tts-api"
import { ttsQueryKeys } from "@/features/tts/query-keys"

export const useAudioList = (skip = 0, limit = 20) =>
  useQuery({
    queryFn: () => ttsApi.listAudio(skip, limit),
    queryKey: ttsQueryKeys.list(skip, limit),
  })
