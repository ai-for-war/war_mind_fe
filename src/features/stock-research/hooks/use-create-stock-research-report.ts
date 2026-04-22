import { useMutation } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import type { StockResearchReportCreateRequest } from "@/features/stock-research/types"

export const useCreateStockResearchReport = () =>
  useMutation({
    mutationFn: (payload: StockResearchReportCreateRequest) =>
      stockResearchApi.createStockResearchReport(payload),
    mutationKey: stockResearchQueryKeys.mutation("create"),
  })
