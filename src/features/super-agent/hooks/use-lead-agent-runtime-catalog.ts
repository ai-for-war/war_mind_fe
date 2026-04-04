import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { messagesApi } from "@/features/super-agent/api/messages-api"
import { superAgentQueryKeys } from "@/features/super-agent/query-keys"
import type { LeadAgentRuntimeCatalogResponse } from "@/features/super-agent/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type LeadAgentRuntimeCatalogQueryResult = UseQueryResult<LeadAgentRuntimeCatalogResponse, Error>

type UseLeadAgentRuntimeCatalogResult = LeadAgentRuntimeCatalogQueryResult & {
  catalog: LeadAgentRuntimeCatalogResponse | null
  hasCatalog: boolean
  refetchCatalog: LeadAgentRuntimeCatalogQueryResult["refetch"]
}

export const useLeadAgentRuntimeCatalog = (): UseLeadAgentRuntimeCatalogResult => {
  const activeOrganizationId = useActiveOrganizationId()
  const query = useQuery({
    queryFn: () => messagesApi.getLeadAgentRuntimeCatalog(),
    queryKey: superAgentQueryKeys.runtimeCatalog(activeOrganizationId),
    retry: 2,
  })

  return {
    ...query,
    catalog: query.data ?? null,
    hasCatalog: Boolean(query.data),
    refetchCatalog: query.refetch,
  }
}
