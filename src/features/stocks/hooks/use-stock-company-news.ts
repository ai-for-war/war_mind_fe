import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import { normalizeStockCompanySymbol } from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyNewsOptions = {
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyNews = ({
  isEnabled = true,
  symbol,
}: UseStockCompanyNewsOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const shouldFetchNews = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () => stocksApi.getStockCompanyNews(normalizedSymbol ?? ""),
    queryKey: stocksQueryKeys.companyNews(activeOrganizationId, normalizedSymbol),
    enabled: shouldFetchNews,
  })

  return {
    ...query,
    symbol: normalizedSymbol,
  }
}
