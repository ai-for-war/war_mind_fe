import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import {
  normalizeStockCompanyOfficersFilter,
  normalizeStockCompanySymbol,
  type StockCompanyOfficersFilter,
} from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockCompanyOfficersOptions = {
  filterBy?: StockCompanyOfficersFilter | null
  isEnabled?: boolean
  symbol?: string | null
}

export const useStockCompanyOfficers = ({
  filterBy,
  isEnabled = true,
  symbol,
}: UseStockCompanyOfficersOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const normalizedFilterBy = normalizeStockCompanyOfficersFilter(filterBy)
  const shouldFetchOfficers = isEnabled && normalizedSymbol != null

  const query = useQuery({
    queryFn: () =>
      stocksApi.getStockCompanyOfficers(normalizedSymbol ?? "", normalizedFilterBy),
    queryKey: stocksQueryKeys.companyOfficers(
      activeOrganizationId,
      normalizedSymbol,
      normalizedFilterBy,
    ),
    enabled: shouldFetchOfficers,
  })

  return {
    ...query,
    filterBy: normalizedFilterBy,
    symbol: normalizedSymbol,
  }
}
