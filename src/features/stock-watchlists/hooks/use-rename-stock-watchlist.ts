import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockWatchlistsApi } from "@/features/stock-watchlists/api"
import { stockWatchlistsQueryKeys } from "@/features/stock-watchlists/query-keys"
import type { RenameStockWatchlistMutationInput } from "@/features/stock-watchlists/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useRenameStockWatchlist = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ payload, watchlistId }: RenameStockWatchlistMutationInput) =>
      stockWatchlistsApi.renameStockWatchlist(watchlistId, payload),
    mutationKey: stockWatchlistsQueryKeys.mutation("rename"),
    onSuccess: async (updatedWatchlist) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockWatchlistsQueryKeys.summaries(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockWatchlistsQueryKeys.items(
            activeOrganizationId,
            updatedWatchlist.id,
          ),
        }),
      ])
    },
  })
}
