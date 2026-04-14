import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import { normalizeStockCompanySymbol } from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyAffiliateOptions = {
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyAffiliate = ({
  isEnabled = true,
  symbol,
}: UseStockCompanyAffiliateOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const shouldFetchAffiliate = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () => stocksApi.getStockCompanyAffiliate(normalizedSymbol ?? ""),
    queryKey: stocksQueryKeys.companyAffiliate(activeOrganizationId, normalizedSymbol),
    enabled: shouldFetchAffiliate,
  })

  return {
    ...query,
    symbol: normalizedSymbol,
  }
}
