import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockWatchlistsApi } from "@/features/stock-watchlists/api"
import { stockWatchlistsQueryKeys } from "@/features/stock-watchlists/query-keys"
import type { AddStockWatchlistItemMutationInput } from "@/features/stock-watchlists/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useAddStockWatchlistItem = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload, watchlistId }: AddStockWatchlistItemMutationInput) =>
      stockWatchlistsApi.addStockWatchlistItem(watchlistId, payload),
    mutationKey: stockWatchlistsQueryKeys.mutation("add-item"),
    onSuccess: async (createdWatchlistItem) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockWatchlistsQueryKeys.summaries(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockWatchlistsQueryKeys.items(
            activeOrganizationId,
            createdWatchlistItem.watchlist_id,
          ),
        }),
      ])
    },
  })
}
