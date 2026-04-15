import { useInfiniteQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import {
  normalizeStockCompanySymbol,
  normalizeStockPriceIntradayPageSize,
  type StockPriceIntradayResponse,
} from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockPriceIntradayOptions = {
  isEnabled?: boolean
  pageSize?: number | null
  symbol?: string | null
}

const getPreviousIntradayCursor = (items: Array<{ time: string | null }> | undefined): string | undefined => {
  if (!items || items.length === 0) {
    return undefined
  }

  const firstItemWithTime = items.find((item) => item.time?.trim())

  return firstItemWithTime?.time?.trim() || undefined
}

export const useStockPriceIntraday = ({
  isEnabled = true,
  pageSize,
  symbol,
}: UseStockPriceIntradayOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const normalizedPageSize = normalizeStockPriceIntradayPageSize(pageSize)
  const shouldFetchIntraday = isEnabled && normalizedSymbol != null

  const query = useInfiniteQuery({
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      stocksApi.getStockPriceIntraday(normalizedSymbol ?? "", {
        ...(pageParam ? { lastTime: pageParam } : {}),
        pageSize: normalizedPageSize,
      }),
    queryKey: stocksQueryKeys.priceIntraday(activeOrganizationId, normalizedSymbol, {
      pageSize: normalizedPageSize,
    }),
    getNextPageParam: () => undefined,
    getPreviousPageParam: (firstPage: StockPriceIntradayResponse) =>
      getPreviousIntradayCursor(firstPage.items),
    enabled: shouldFetchIntraday,
  })

  return {
    ...query,
    pageSize: normalizedPageSize,
    symbol: normalizedSymbol,
  }
}
