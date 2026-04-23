import { useInfiniteQuery } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchReportListFilters } from "@/features/stock-research/types"
import {
  getNextStockResearchReportsPage,
  normalizeStockResearchReportListFilters,
} from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useStockResearchReports = (filters?: StockResearchReportListFilters) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedFilters = normalizeStockResearchReportListFilters(filters)

  const query = useInfiniteQuery({
    // Local stock research guide still shows an unpaginated list response; backend now serves
    // paginated pages for this endpoint, so the UI drives loading via page/page_size.
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      stockResearchApi.listStockResearchReports({
        ...normalizedFilters,
        page: pageParam,
      }),
    queryKey: stockResearchQueryKeys.reportList(activeOrganizationId, normalizedFilters),
    getNextPageParam: (lastPage, allPages) =>
      getNextStockResearchReportsPage(lastPage, allPages),
  })

  const seenReportIds = new Set<string>()
  const pages = query.data?.pages ?? []
  const items = pages.flatMap((page) =>
    page.items.filter((report) => {
      if (seenReportIds.has(report.id)) {
        return false
      }

      seenReportIds.add(report.id)
      return true
    }),
  )
  const total = pages[0]?.total ?? items.length

  return {
    ...query,
    activeFilters: normalizedFilters,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    items,
    total,
  }
}
