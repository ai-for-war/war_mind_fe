import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import { normalizeStockCompanySymbol } from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyReportsOptions = {
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyReports = ({
  isEnabled = true,
  symbol,
}: UseStockCompanyReportsOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const shouldFetchReports = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () => stocksApi.getStockCompanyReports(normalizedSymbol ?? ""),
    queryKey: stocksQueryKeys.companyReports(activeOrganizationId, normalizedSymbol),
    enabled: shouldFetchReports,
  })

  return {
    ...query,
    symbol: normalizedSymbol,
  }
}
