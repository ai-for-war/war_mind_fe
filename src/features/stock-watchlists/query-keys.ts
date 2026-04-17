import { normalizeStockWatchlistId } from "@/features/stock-watchlists/types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const STOCK_WATCHLISTS_QUERY_KEY = ["stock-watchlists"] as const

export const stockWatchlistsQueryKeys = {
  all: STOCK_WATCHLISTS_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [
      ...stockWatchlistsQueryKeys.all,
      "organization",
      getOrganizationQueryScope(organizationId),
    ] as const,
  summaries: (organizationId?: string | null) =>
    [...stockWatchlistsQueryKeys.scoped(organizationId), "summaries"] as const,
  itemLists: (organizationId?: string | null) =>
    [...stockWatchlistsQueryKeys.scoped(organizationId), "items"] as const,
  items: (organizationId?: string | null, watchlistId?: string | null) =>
    [
      ...stockWatchlistsQueryKeys.itemLists(organizationId),
      normalizeStockWatchlistId(watchlistId),
    ] as const,
  mutations: () => [...stockWatchlistsQueryKeys.all, "mutation"] as const,
  mutation: (name: string) => [...stockWatchlistsQueryKeys.mutations(), name] as const,
}
