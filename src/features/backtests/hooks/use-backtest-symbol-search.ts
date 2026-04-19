import { useInfiniteQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import {
  getNextStockCatalogPage,
  normalizeStockCatalogFilters,
} from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseBacktestSymbolSearchOptions = {
  isEnabled?: boolean
  pageSize?: number
  query?: string | null
}

const DEFAULT_SYMBOL_SEARCH_PAGE_SIZE = 10

export const useBacktestSymbolSearch = ({
  isEnabled = true,
  pageSize = DEFAULT_SYMBOL_SEARCH_PAGE_SIZE,
  query,
}: UseBacktestSymbolSearchOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedFilters = normalizeStockCatalogFilters({
    pageSize,
    q: query,
  })
  const hasSearchQuery = normalizedFilters.q != null

  const searchQuery = useInfiniteQuery({
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      stocksApi.getStockCatalog({
        ...normalizedFilters,
        page: pageParam,
      }),
    queryKey: stocksQueryKeys.catalog(activeOrganizationId, normalizedFilters),
    enabled: isEnabled && hasSearchQuery,
    getNextPageParam: (lastPage, allPages) => getNextStockCatalogPage(lastPage, allPages),
  })

  const pages = searchQuery.data?.pages ?? []
  const items = pages.flatMap((page) => page.items)
  const total = pages[0]?.total ?? 0

  return {
    ...searchQuery,
    hasSearchQuery,
    items,
    pageSize: normalizedFilters.pageSize,
    query: normalizedFilters.q,
    total,
  }
}
