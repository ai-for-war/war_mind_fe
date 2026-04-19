import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockWatchlistsApi } from "@/features/stock-watchlists/api"
import { stockWatchlistsQueryKeys } from "@/features/stock-watchlists/query-keys"
import type { CreateStockWatchlistRequest } from "@/features/stock-watchlists/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useCreateStockWatchlist = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateStockWatchlistRequest) =>
      stockWatchlistsApi.createStockWatchlist(payload),
    mutationKey: stockWatchlistsQueryKeys.mutation("create"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: stockWatchlistsQueryKeys.summaries(activeOrganizationId),
      })
    },
  })
}
