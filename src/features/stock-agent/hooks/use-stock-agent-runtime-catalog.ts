import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { stockAgentMessagesApi } from "@/features/stock-agent/api/messages-api"
import { stockAgentQueryKeys } from "@/features/stock-agent/query-keys"
import type { StockAgentRuntimeCatalogResponse } from "@/features/stock-agent/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type StockAgentRuntimeCatalogQueryResult = UseQueryResult<
  StockAgentRuntimeCatalogResponse,
  Error
>

type UseStockAgentRuntimeCatalogResult = StockAgentRuntimeCatalogQueryResult & {
  catalog: StockAgentRuntimeCatalogResponse | null
  hasCatalog: boolean
  refetchCatalog: StockAgentRuntimeCatalogQueryResult["refetch"]
}

export const useStockAgentRuntimeCatalog = (): UseStockAgentRuntimeCatalogResult => {
  const activeOrganizationId = useActiveOrganizationId()
  const query = useQuery({
    queryFn: () => stockAgentMessagesApi.getStockAgentRuntimeCatalog(),
    queryKey: stockAgentQueryKeys.runtimeCatalog(activeOrganizationId),
    retry: 2,
  })

  return {
    ...query,
    catalog: query.data ?? null,
    hasCatalog: Boolean(query.data),
    refetchCatalog: query.refetch,
  }
}
