import { useQuery } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useStockResearchCatalog = () => {
  const activeOrganizationId = useActiveOrganizationId()

  const query = useQuery({
    queryFn: () => stockResearchApi.getStockResearchCatalog(),
    queryKey: stockResearchQueryKeys.catalog(activeOrganizationId),
  })

  return {
    ...query,
    defaultModel: query.data?.default_model ?? null,
    defaultProvider: query.data?.default_provider ?? null,
    defaultReasoning: query.data?.default_reasoning ?? null,
    providers: query.data?.providers ?? [],
  }
}
