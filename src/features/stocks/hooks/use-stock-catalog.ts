import { useInfiniteQuery } from "@tanstack/react-query"

import { stocksApi } from "@/features/stocks/api"
import { stocksQueryKeys } from "@/features/stocks/query-keys"
import type { StockCatalogFilters } from "@/features/stocks/types"
import {
  getNextStockCatalogPage,
  normalizeStockCatalogFilters,
} from "@/features/stocks/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useStockCatalog = (filters?: StockCatalogFilters) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedFilters = normalizeStockCatalogFilters(filters)

  const query = useInfiniteQuery({
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      stocksApi.getStockCatalog({
        ...normalizedFilters,
        page: pageParam,
      }),
    queryKey: stocksQueryKeys.catalog(activeOrganizationId, normalizedFilters),
    getNextPageParam: (lastPage, allPages) => getNextStockCatalogPage(lastPage, allPages),
  })

  const pages = query.data?.pages ?? []
  const items = pages.flatMap((page) => page.items)
  const total = pages[0]?.total ?? 0
  const snapshotAt = items[0]?.snapshot_at ?? null
  const lastUpdatedAt = items[0]?.updated_at ?? null

  return {
    ...query,
    activeFilters: normalizedFilters,
    items,
    lastUpdatedAt,
    pageSize: normalizedFilters.pageSize,
    snapshotAt,
    total,
  }
}
