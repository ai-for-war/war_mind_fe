import { useMutation, useQueryClient } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchReportCreateRequest } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useCreateStockResearchReport = () => {
  const queryClient = useQueryClient()
  const activeOrganizationId = useActiveOrganizationId()

  return useMutation({
    mutationFn: (payload: StockResearchReportCreateRequest) =>
      stockResearchApi.createStockResearchReport(payload),
    mutationKey: stockResearchQueryKeys.mutation("create"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: stockResearchQueryKeys.reportLists(activeOrganizationId),
      })
    },
  })
}
