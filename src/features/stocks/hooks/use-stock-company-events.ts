import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import { normalizeStockCompanySymbol } from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyEventsOptions = {
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyEvents = ({
  isEnabled = true,
  symbol,
}: UseStockCompanyEventsOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const shouldFetchEvents = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () => stocksApi.getStockCompanyEvents(normalizedSymbol ?? ""),
    queryKey: stocksQueryKeys.companyEvents(activeOrganizationId, normalizedSymbol),
    enabled: shouldFetchEvents,
  })

  return {
    ...query,
    symbol: normalizedSymbol,
  }
}
