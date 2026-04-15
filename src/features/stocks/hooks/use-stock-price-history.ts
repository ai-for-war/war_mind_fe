import { useMemo } from "react"

import { useQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import {
  normalizeStockCompanySymbol,
  normalizeStockPriceHistoryInterval,
  normalizeStockPriceLookbackLength,
  type StockPriceHistoryQuery,
} from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockPriceHistoryOptions = {
  isEnabled?: boolean
  query: StockPriceHistoryQuery
  symbol?: string | null
}

export const useStockPriceHistory = ({
  isEnabled = true,
  query,
  symbol,
}: UseStockPriceHistoryOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)

  const normalizedQuery = useMemo<StockPriceHistoryQuery>(() => {
    if ("length" in query) {
      return {
        interval: normalizeStockPriceHistoryInterval(query.interval),
        length: normalizeStockPriceLookbackLength(query.length),
      }
    }

    return {
      interval: normalizeStockPriceHistoryInterval(query.interval),
      start: query.start.trim(),
      ...(query.end?.trim() ? { end: query.end.trim() } : {}),
    }
  }, [query])

  const shouldFetchHistory =
    isEnabled && normalizedSymbol != null && ("length" in normalizedQuery || normalizedQuery.start.length > 0)

  const queryResult = useQuery({
    queryFn: () => stocksApi.getStockPriceHistory(normalizedSymbol ?? "", normalizedQuery),
    queryKey: stocksQueryKeys.priceHistory(activeOrganizationId, normalizedSymbol, {
      interval: normalizedQuery.interval,
      ...("length" in normalizedQuery
        ? { length: normalizedQuery.length }
        : {
            end: normalizedQuery.end,
            start: normalizedQuery.start,
          }),
    }),
    enabled: shouldFetchHistory,
  })

  return {
    ...queryResult,
    request: normalizedQuery,
    symbol: normalizedSymbol,
  }
}
