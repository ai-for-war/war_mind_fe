import { useQuery } from "@tanstack/react-query"

import { stockResearchApi } from "@/features/stock-research/api"
import { stockResearchQueryKeys } from "@/features/stock-research/query-keys"
import { normalizeStockResearchScheduleId } from "@/features/stock-research/stock-research-schedules.utils"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseStockResearchScheduleOptions = {
  isEnabled?: boolean
  scheduleId?: string | null
}

export const useStockResearchSchedule = ({
  isEnabled = true,
  scheduleId,
}: UseStockResearchScheduleOptions) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedScheduleId = normalizeStockResearchScheduleId(scheduleId)
  const shouldFetchSchedule = isEnabled && normalizedScheduleId != null

  const query = useQuery({
    queryFn: () => stockResearchApi.getStockResearchSchedule(normalizedScheduleId ?? ""),
    queryKey: stockResearchQueryKeys.scheduleDetail(
      activeOrganizationId,
      normalizedScheduleId,
    ),
    enabled: shouldFetchSchedule,
  })

  return {
    ...query,
    schedule: query.data ?? null,
    scheduleId: normalizedScheduleId,
  }
}
