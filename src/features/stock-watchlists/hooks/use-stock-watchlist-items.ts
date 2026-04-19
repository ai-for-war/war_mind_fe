import { useQuery } from "@tanstack/react-query"

import { stockWatchlistsApi } from "@/features/stock-watchlists/api"
import { stockWatchlistsQueryKeys } from "@/features/stock-watchlists/query-keys"
import { normalizeStockWatchlistId } from "@/features/stock-watchlists/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockWatchlistItemsOptions = {
  isEnabled?: boolean
  watchlistId?: string | null
}

export const useStockWatchlistItems = ({
  isEnabled = true,
  watchlistId,
}: UseStockWatchlistItemsOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedWatchlistId = normalizeStockWatchlistId(watchlistId)
  const shouldFetchItems = isEnabled && normalizedWatchlistId != null

  const query = useQuery({
    queryFn: () => stockWatchlistsApi.listStockWatchlistItems(normalizedWatchlistId ?? ""),
    queryKey: stockWatchlistsQueryKeys.items(
      activeOrganizationId,
      normalizedWatchlistId,
    ),
    enabled: shouldFetchItems,
  })

  return {
    ...query,
    items: query.data?.items ?? [],
    watchlist: query.data?.watchlist ?? null,
    watchlistId: normalizedWatchlistId,
  }
}
