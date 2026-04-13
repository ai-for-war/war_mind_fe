import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import { normalizeStockCompanySymbol } from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyOverviewOptions = {
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyOverview = ({
  isEnabled = true,
  symbol,
}: UseStockCompanyOverviewOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const shouldFetchOverview = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () => stocksApi.getStockCompanyOverview(normalizedSymbol ?? ""),
    queryKey: stocksQueryKeys.companyOverview(activeOrganizationId, normalizedSymbol),
    enabled: shouldFetchOverview,
  })

  return {
    ...query,
    symbol: normalizedSymbol,
  }
}
