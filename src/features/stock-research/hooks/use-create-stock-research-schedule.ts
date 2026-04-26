import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchScheduleCreateRequest } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useCreateStockResearchSchedule = () => {
  const queryClient = useQueryClient()
  const activeOrganizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: (payload: StockResearchScheduleCreateRequest) =>
      stockResearchApi.createStockResearchSchedule(payload),
    mutationKey: stockResearchQueryKeys.mutation("create-schedule"),
    onSuccess: async (createdSchedule) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockResearchQueryKeys.scheduleLists(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockResearchQueryKeys.scheduleDetail(
            activeOrganizationId,
            createdSchedule.id,
          ),
        }),
      ])
    },
  })
}
