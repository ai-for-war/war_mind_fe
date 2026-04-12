import type { NormalizedStockCatalogFilters } from "@/features/stocks/types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const STOCKS_QUERY_KEY = ["stocks"] as const

export const stocksQueryKeys = {
  all: STOCKS_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [...STOCKS_QUERY_KEY, "organization", getOrganizationQueryScope(organizationId)] as const,
  catalogLists: (organizationId?: string | null) =>
    [...stocksQueryKeys.scoped(organizationId), "catalog"] as const,
  catalog: (
    organizationId: string | null | undefined,
    filters: NormalizedStockCatalogFilters,
  ) =>
    [
      ...stocksQueryKeys.catalogLists(organizationId),
      filters.q,
      filters.exchange,
      filters.group,
      filters.industryCode,
      filters.pageSize,
    ] as const,
}
