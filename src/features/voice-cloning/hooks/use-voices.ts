import { useQuery } from "@tanstack/react-query"

import { voicesApi } from "@/features/voice-cloning/api/voices-api"
import { voiceQueryKeys } from "@/features/voice-cloning/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useVoices = () => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    queryFn: voicesApi.listVoices,
    queryKey: voiceQueryKeys.scoped(activeOrganizationId),
  })
}
