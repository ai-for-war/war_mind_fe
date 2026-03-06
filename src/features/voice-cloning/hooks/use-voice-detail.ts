import { useQuery } from "@tanstack/react-query"

import { voicesApi } from "@/features/voice-cloning/api/voices-api"
import { voiceQueryKeys } from "@/features/voice-cloning/query-keys"

export const useVoiceDetail = (voiceId?: string) =>
  useQuery({
    enabled: Boolean(voiceId?.trim()),
    queryFn: () => voicesApi.getVoice(voiceId as string),
    queryKey: voiceQueryKeys.detail(voiceId),
  })
