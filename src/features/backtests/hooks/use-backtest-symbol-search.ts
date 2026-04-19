import { useDeferredValue } from "react"
import { useQuery } from "@tanstack/react-query"

import { backtestsQueryKeys } from "@/features/backtests/query-keys"
import { stocksApi } from "@/features/stocks/api"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

const BACKTEST_SYMBOL_SEARCH_PAGE_SIZE = 8

export const useBacktestSymbolSearch = (query?: string) => {
  const activeOrganizationId = useActiveOrganizationId()
  const deferredQuery = useDeferredValue(query?.trim() ?? "")

  const searchQuery = useQuery({
    queryFn: () =>
      stocksApi.getStockCatalog({
        page: 1,
        pageSize: BACKTEST_SYMBOL_SEARCH_PAGE_SIZE,
        q: deferredQuery || null,
        exchange: null,
        group: null,
        industryCode: null,
      }),
    queryKey: backtestsQueryKeys.symbolSearch(activeOrganizationId, deferredQuery),
  })

  return {
    ...searchQuery,
    items: searchQuery.data?.items ?? [],
    query: deferredQuery,
  }
}
