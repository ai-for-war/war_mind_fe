import { useQuery } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchReportListFilters } from "@/features/stock-research/types"
import { normalizeStockResearchReportListFilters } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useStockResearchReports = (filters?: StockResearchReportListFilters) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedFilters = normalizeStockResearchReportListFilters(filters)

  const query = useQuery({
    queryFn: () => stockResearchApi.listStockResearchReports(normalizedFilters),
    queryKey: stockResearchQueryKeys.reportList(activeOrganizationId, normalizedFilters),
  })

  return {
    ...query,
    activeFilters: normalizedFilters,
    items: query.data?.items ?? [],
  }
}
