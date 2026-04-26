import { useInfiniteQuery } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import {
  getNextStockResearchSchedulesPage,
  normalizeStockResearchScheduleListFilters,
} from "@/features/stock-research/stock-research-schedules.utils"
import type { StockResearchScheduleListFilters } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useStockResearchSchedules = (
  filters?: StockResearchScheduleListFilters,
) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedFilters = normalizeStockResearchScheduleListFilters(filters)

  const query = useInfiniteQuery({
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      stockResearchApi.listStockResearchSchedules({
        ...normalizedFilters,
        page: pageParam,
      }),
    queryKey: stockResearchQueryKeys.scheduleList(
      activeOrganizationId,
      normalizedFilters,
    ),
    getNextPageParam: (lastPage, allPages) =>
      getNextStockResearchSchedulesPage(lastPage, allPages),
  })

  const seenScheduleIds = new Set<string>()
  const pages = query.data?.pages ?? []
  const items = pages.flatMap((page) =>
    page.items.filter((schedule) => {
      if (seenScheduleIds.has(schedule.id)) {
        return false
      }

      seenScheduleIds.add(schedule.id)
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
