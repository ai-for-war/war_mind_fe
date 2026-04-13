import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import {
  normalizeStockCompanySubsidiariesFilter,
  normalizeStockCompanySymbol,
  type StockCompanySubsidiariesFilter,
} from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanySubsidiariesOptions = {
  filterBy?: StockCompanySubsidiariesFilter | null
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanySubsidiaries = ({
  filterBy,
  isEnabled = true,
  symbol,
}: UseStockCompanySubsidiariesOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const normalizedFilterBy = normalizeStockCompanySubsidiariesFilter(filterBy)
  const shouldFetchSubsidiaries = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () =>
      stocksApi.getStockCompanySubsidiaries(normalizedSymbol ?? "", normalizedFilterBy),
    queryKey: stocksQueryKeys.companySubsidiaries(
      activeOrganizationId,
      normalizedSymbol,
      normalizedFilterBy,
    ),
    enabled: shouldFetchSubsidiaries,
  })

  return {
    ...query,
    filterBy: normalizedFilterBy,
    symbol: normalizedSymbol,
  }
}
