import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockWatchlistsApi } from "@/features/stock-watchlists/api"
import { stockWatchlistsQueryKeys } from "@/features/stock-watchlists/query-keys"
import type { RemoveStockWatchlistItemMutationInput } from "@/features/stock-watchlists/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useRemoveStockWatchlistItem = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ symbol, watchlistId }: RemoveStockWatchlistItemMutationInput) =>
      stockWatchlistsApi.removeStockWatchlistItem(watchlistId, symbol),
    mutationKey: stockWatchlistsQueryKeys.mutation("remove-item"),
    onSuccess: async (removedWatchlistItem) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockWatchlistsQueryKeys.summaries(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockWatchlistsQueryKeys.items(
            activeOrganizationId,
            removedWatchlistItem.watchlist_id,
          ),
        }),
      ])
    },
  })
}
