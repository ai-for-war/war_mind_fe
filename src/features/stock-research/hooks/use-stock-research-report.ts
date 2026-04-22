import { useQuery } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import { normalizeStockResearchReportId } from "@/features/stock-research/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockResearchReportOptions = {
  isEnabled?: boolean
  reportId?: string | null
}

export const useStockResearchReport = ({
  isEnabled = true,
  reportId,
}: UseStockResearchReportOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedReportId = normalizeStockResearchReportId(reportId)
  const shouldFetchReport = isEnabled && normalizedReportId != null

  const query = useQuery({
    queryFn: () => stockResearchApi.getStockResearchReport(normalizedReportId ?? ""),
    queryKey: stockResearchQueryKeys.reportDetail(activeOrganizationId, normalizedReportId),
    enabled: shouldFetchReport,
  })

  return {
    ...query,
    report: query.data ?? null,
    reportId: normalizedReportId,
  }
}
