import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchScheduleIdMutationInput } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const usePauseStockResearchSchedule = () => {
  const queryClient = useQueryClient()
  const activeOrganizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: ({ scheduleId }: StockResearchScheduleIdMutationInput) =>
      stockResearchApi.pauseStockResearchSchedule(scheduleId),
    mutationKey: stockResearchQueryKeys.mutation("pause-schedule"),
    onSuccess: async (pausedSchedule) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: stockResearchQueryKeys.scheduleLists(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: stockResearchQueryKeys.scheduleDetail(
            activeOrganizationId,
            pausedSchedule.id,
          ),
        }),
      ])
    },
  })
}
