import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import { normalizeStockCompanySymbol } from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyShareholdersOptions = {
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyShareholders = ({
  isEnabled = true,
  symbol,
}: UseStockCompanyShareholdersOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const shouldFetchShareholders = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () => stocksApi.getStockCompanyShareholders(normalizedSymbol ?? ""),
    queryKey: stocksQueryKeys.companyShareholders(activeOrganizationId, normalizedSymbol),
    enabled: shouldFetchShareholders,
  })

  return {
    ...query,
    symbol: normalizedSymbol,
  }
}
