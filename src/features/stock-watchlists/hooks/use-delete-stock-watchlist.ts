import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockWatchlistsApi } from "@/features/stock-watchlists/api"
import { stockWatchlistsQueryKeys } from "@/features/stock-watchlists/query-keys"
import type { DeleteStockWatchlistMutationInput } from "@/features/stock-watchlists/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useDeleteStockWatchlist = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ watchlistId }: DeleteStockWatchlistMutationInput) =>
      stockWatchlistsApi.deleteStockWatchlist(watchlistId),
    mutationKey: stockWatchlistsQueryKeys.mutation("delete"),
    onSuccess: async (deletedWatchlist) => {
      await queryClient.cancelQueries({
        queryKey: stockWatchlistsQueryKeys.items(activeOrganizationId, deletedWatchlist.id),
      })

      queryClient.removeQueries({
        queryKey: stockWatchlistsQueryKeys.items(activeOrganizationId, deletedWatchlist.id),
      })

      await queryClient.invalidateQueries({
        queryKey: stockWatchlistsQueryKeys.summaries(activeOrganizationId),
      })
    },
  })
}
