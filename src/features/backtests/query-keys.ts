import type { BacktestRunRequest } from "@/features/backtests/types"
import {
  normalizeBacktestDate,
  normalizeBacktestSymbol,
  normalizeBacktestTemplateId,
  normalizeBacktestTemplateParams,
} from "@/features/backtests/types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const BACKTESTS_QUERY_KEY = ["backtests"] as const

const getBacktestTemplateParamsQueryScope = (
  templateParams?: BacktestRunRequest["template_params"] | null,
) => {
  const normalizedTemplateParams = normalizeBacktestTemplateParams(templateParams)

  if (!normalizedTemplateParams) {
    return "__no_template_params__"
  }

  return Object.entries(normalizedTemplateParams)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}:${value}`)
    .join("|")
}

export const backtestsQueryKeys = {
  all: BACKTESTS_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [...BACKTESTS_QUERY_KEY, "organization", getOrganizationQueryScope(organizationId)] as const,
  symbols: (organizationId?: string | null) =>
    [...backtestsQueryKeys.scoped(organizationId), "symbols"] as const,
  symbolSearch: (organizationId: string | null | undefined, query?: string | null) =>
    [...backtestsQueryKeys.symbols(organizationId), query?.trim() ?? ""] as const,
  templates: (organizationId?: string | null) =>
    [...backtestsQueryKeys.scoped(organizationId), "templates"] as const,
  runs: (organizationId?: string | null) =>
    [...backtestsQueryKeys.scoped(organizationId), "runs"] as const,
  runPreview: (
    organizationId: string | null | undefined,
    request: Partial<BacktestRunRequest>,
  ) =>
    [
      ...backtestsQueryKeys.runs(organizationId),
      normalizeBacktestSymbol(request.symbol),
      normalizeBacktestDate(request.date_from),
      normalizeBacktestDate(request.date_to),
      normalizeBacktestTemplateId(request.template_id),
      getBacktestTemplateParamsQueryScope(request.template_params),
      request.initial_capital ?? null,
    ] as const,
  mutations: () => [...backtestsQueryKeys.all, "mutation"] as const,
  mutation: (name: string) => [...backtestsQueryKeys.mutations(), name] as const,
}
