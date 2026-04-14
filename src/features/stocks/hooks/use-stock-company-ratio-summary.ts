import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import { normalizeStockCompanySymbol } from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyRatioSummaryOptions = {
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyRatioSummary = ({
  isEnabled = true,
  symbol,
}: UseStockCompanyRatioSummaryOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const shouldFetchRatioSummary = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () => stocksApi.getStockCompanyRatioSummary(normalizedSymbol ?? ""),
    queryKey: stocksQueryKeys.companyRatioSummary(activeOrganizationId, normalizedSymbol),
    enabled: shouldFetchRatioSummary,
  })

  return {
    ...query,
    symbol: normalizedSymbol,
  }
}
