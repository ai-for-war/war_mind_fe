import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchScheduleIdMutationInput } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useDeleteStockResearchSchedule = () => {
  const queryClient = useQueryClient()
  const activeOrganizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: ({ scheduleId }: StockResearchScheduleIdMutationInput) =>
      stockResearchApi.deleteStockResearchSchedule(scheduleId),
    mutationKey: stockResearchQueryKeys.mutation("delete-schedule"),
    onSuccess: async (deletedSchedule) => {
      await queryClient.cancelQueries({
        queryKey: stockResearchQueryKeys.scheduleDetail(
          activeOrganizationId,
          deletedSchedule.id,
        ),
      })

      queryClient.removeQueries({
        queryKey: stockResearchQueryKeys.scheduleDetail(
          activeOrganizationId,
          deletedSchedule.id,
        ),
      })

      await queryClient.invalidateQueries({
        queryKey: stockResearchQueryKeys.scheduleLists(activeOrganizationId),
      })
    },
  })
}
