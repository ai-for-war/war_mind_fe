import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchScheduleUpdateMutationInput } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useUpdateStockResearchSchedule = () => {
  const queryClient = useQueryClient()
  const activeOrganizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: ({ payload, scheduleId }: StockResearchScheduleUpdateMutationInput) =>
      stockResearchApi.updateStockResearchSchedule(scheduleId, payload),
    mutationKey: stockResearchQueryKeys.mutation("update-schedule"),
    onSuccess: async (updatedSchedule) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockResearchQueryKeys.scheduleLists(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockResearchQueryKeys.scheduleDetail(
            activeOrganizationId,
            updatedSchedule.id,
          ),
        }),
      ])
    },
  })
}
