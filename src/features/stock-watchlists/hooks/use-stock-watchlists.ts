import { useQuery } from "@tanstack/react-query"

import { stockWatchlistsApi } from "@/features/stock-watchlists/api"
import { stockWatchlistsQueryKeys } from "@/features/stock-watchlists/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useStockWatchlists = () => {
  const activeOrganizationId = useActiveOrganizationId()

  const query = useQuery({
    queryFn: () => stockWatchlistsApi.listStockWatchlists(),
    queryKey: stockWatchlistsQueryKeys.summaries(activeOrganizationId),
  })

  return {
    ...query,
    items: query.data?.items ?? [],
  }
}
