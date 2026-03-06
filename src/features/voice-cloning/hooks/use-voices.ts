import { useQuery } from "@tanstack/react-query"

import { voicesApi } from "@/features/voice-cloning/api/voices-api"
import { voiceQueryKeys } from "@/features/voice-cloning/query-keys"

export const useVoices = () =>
  useQuery({
    queryFn: voicesApi.listVoices,
    queryKey: voiceQueryKeys.all,
  })
