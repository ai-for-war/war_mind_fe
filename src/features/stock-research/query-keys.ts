import type { NormalizedStockResearchReportListFilters } from "@/features/stock-research/types"
import {
  normalizeStockResearchReportId,
  normalizeStockResearchReportListFilters,
} from "@/features/stock-research/types"
import type { NormalizedStockResearchScheduleListFilters } from "@/features/stock-research/types"
import {
  normalizeStockResearchScheduleId,
  normalizeStockResearchScheduleListFilters,
} from "@/features/stock-research/stock-research-schedules.utils"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const STOCK_RESEARCH_QUERY_KEY = ["stock-research"] as const

export const stockResearchQueryKeys = {
  all: STOCK_RESEARCH_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [
      ...stockResearchQueryKeys.all,
      "organization",
      getOrganizationQueryScope(organizationId),
    ] as const,
  catalog: (organizationId?: string | null) =>
    [...stockResearchQueryKeys.scoped(organizationId), "catalog"] as const,
  reportLists: (organizationId?: string | null) =>
    [...stockResearchQueryKeys.scoped(organizationId), "reports"] as const,
  reportList: (
    organizationId: string | null | undefined,
    filters?: NormalizedStockResearchReportListFilters,
  ) => {
    const normalizedFilters = normalizeStockResearchReportListFilters(filters)

    return [
      ...stockResearchQueryKeys.reportLists(organizationId),
      normalizedFilters.symbol,
      normalizedFilters.pageSize,
    ] as const
  },
  reportDetails: (organizationId?: string | null) =>
    [...stockResearchQueryKeys.scoped(organizationId), "report-detail"] as const,
  reportDetail: (
    organizationId: string | null | undefined,
    reportId?: string | null,
  ) =>
    [
      ...stockResearchQueryKeys.reportDetails(organizationId),
      normalizeStockResearchReportId(reportId),
    ] as const,
  scheduleLists: (organizationId?: string | null) =>
    [...stockResearchQueryKeys.scoped(organizationId), "schedules"] as const,
  scheduleList: (
    organizationId: string | null | undefined,
    filters?: NormalizedStockResearchScheduleListFilters,
  ) => {
    const normalizedFilters = normalizeStockResearchScheduleListFilters(filters)

    return [
      ...stockResearchQueryKeys.scheduleLists(organizationId),
      normalizedFilters.pageSize,
    ] as const
  },
  scheduleDetails: (organizationId?: string | null) =>
    [...stockResearchQueryKeys.scoped(organizationId), "schedule-detail"] as const,
  scheduleDetail: (
    organizationId: string | null | undefined,
    scheduleId?: string | null,
  ) =>
    [
      ...stockResearchQueryKeys.scheduleDetails(organizationId),
      normalizeStockResearchScheduleId(scheduleId),
    ] as const,
  mutations: () => [...stockResearchQueryKeys.all, "mutation"] as const,
  mutation: (name: string) => [...stockResearchQueryKeys.mutations(), name] as const,
}
