import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { messagesApi } from "@/features/super-agent/api/messages-api"
import { superAgentQueryKeys } from "@/features/super-agent/query-keys"
import type { LeadAgentRuntimeCatalogResponse } from "@/features/super-agent/types"

type LeadAgentRuntimeCatalogQueryResult = UseQueryResult<LeadAgentRuntimeCatalogResponse, Error>

type UseLeadAgentRuntimeCatalogResult = LeadAgentRuntimeCatalogQueryResult & {
  catalog: LeadAgentRuntimeCatalogResponse | null
  hasCatalog: boolean
  refetchCatalog: LeadAgentRuntimeCatalogQueryResult["refetch"]
}

export const useLeadAgentRuntimeCatalog = (): UseLeadAgentRuntimeCatalogResult => {
  const query = useQuery({
    queryFn: () => messagesApi.getLeadAgentRuntimeCatalog(),
    queryKey: superAgentQueryKeys.runtimeCatalog(),
    retry: 2,
  })

  return {
    ...query,
    catalog: query.data ?? null,
    hasCatalog: Boolean(query.data),
    refetchCatalog: query.refetch,
  }
}
