export type StockResearchReportStatus =
  | "queued"
  | "running"
  | "completed"
  | "partial"
  | "failed"

export type StockResearchScheduleType =
  | "every_15_minutes"
  | "daily"
  | "weekly"

export type StockResearchScheduleStatus =
  | "active"
  | "paused"
  | "deleted"

export type StockResearchScheduleWeekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type StockResearchRuntimeConfig = {
  provider: string
  model: string
  reasoning?: string | null
}

export type StockResearchRuntimeConfigResponse = {
  provider: string
  model: string
  reasoning: string | null
}

export type StockResearchCatalogModelResponse = {
  model: string
  reasoning_options: string[]
  default_reasoning: string | null
  is_default: boolean
}

export type StockResearchCatalogProviderResponse = {
  provider: string
  display_name: string
  is_default: boolean
  models: StockResearchCatalogModelResponse[]
}

export type StockResearchCatalogResponse = {
  default_provider: string
  default_model: string
  default_reasoning: string | null
  providers: StockResearchCatalogProviderResponse[]
}

export type StockResearchReportSourceResponse = {
  source_id: string
  url: string
  title: string
}

export type StockResearchReportFailureResponse = {
  code: string
  message: string
}

export type StockResearchReportSummary = {
  id: string
  symbol: string
  status: StockResearchReportStatus
  created_at: string
  started_at: string | null
  completed_at: string | null
  updated_at: string
  runtime_config: StockResearchRuntimeConfigResponse | null
}

export type StockResearchReportResponse = StockResearchReportSummary & {
  content: string | null
  sources: StockResearchReportSourceResponse[]
  error: StockResearchReportFailureResponse | null
}

export type StockResearchReportCreateRequest = {
  symbol: string
  runtime_config?: StockResearchRuntimeConfig | null
}

export type StockResearchReportCreateResponse = StockResearchReportSummary

export type StockResearchReportListFilters = {
  symbol?: string | null
  pageSize?: number | null
}

export type NormalizedStockResearchReportListFilters = {
  symbol: string | null
  pageSize: number
}

export type StockResearchReportListResponse = {
  items: StockResearchReportSummary[]
  total?: number
  page: number
  page_size: number
}

export type Every15MinutesStockResearchScheduleDefinitionRequest = {
  type: "every_15_minutes"
}

export type DailyStockResearchScheduleDefinitionRequest = {
  type: "daily"
  hour: number
}

export type WeeklyStockResearchScheduleDefinitionRequest = {
  type: "weekly"
  hour: number
  weekdays: StockResearchScheduleWeekday[]
}

export type StockResearchScheduleDefinitionRequest =
  | Every15MinutesStockResearchScheduleDefinitionRequest
  | DailyStockResearchScheduleDefinitionRequest
  | WeeklyStockResearchScheduleDefinitionRequest

export type StockResearchScheduleDefinitionResponse = {
  type: StockResearchScheduleType
  hour: number | null
  weekdays: StockResearchScheduleWeekday[]
}

export type StockResearchScheduleSummary = {
  id: string
  symbol: string
  status: StockResearchScheduleStatus
  schedule: StockResearchScheduleDefinitionResponse
  next_run_at: string
  created_at: string
  updated_at: string
  runtime_config: StockResearchRuntimeConfigResponse
}

export type StockResearchScheduleResponse = StockResearchScheduleSummary

export type StockResearchScheduleCreateRequest = {
  symbol: string
  runtime_config: StockResearchRuntimeConfig
  schedule: StockResearchScheduleDefinitionRequest
}

export type StockResearchScheduleUpdateRequest = {
  symbol?: string | null
  runtime_config?: StockResearchRuntimeConfig | null
  schedule?: StockResearchScheduleDefinitionRequest | null
  status?: StockResearchScheduleStatus | null
}

export type StockResearchScheduleListFilters = {
  pageSize?: number | null
}

export type NormalizedStockResearchScheduleListFilters = {
  pageSize: number
}

export type StockResearchScheduleListResponse = {
  items: StockResearchScheduleSummary[]
  total: number
  page: number
  page_size: number
}

export type StockResearchScheduleDeleteResponse = {
  id: string
  deleted: true
}

export type StockResearchScheduleUpdateMutationInput = {
  scheduleId: string
  payload: StockResearchScheduleUpdateRequest
}

export type StockResearchScheduleIdMutationInput = {
  scheduleId: string
}

export const DEFAULT_STOCK_RESEARCH_REPORT_PAGE_SIZE = 20
export const DEFAULT_STOCK_RESEARCH_SCHEDULE_PAGE_SIZE = 20

export const normalizeStockResearchSymbol = (symbol?: string | null): string | null => {
  const normalizedSymbol = symbol?.trim()

  if (!normalizedSymbol) {
    return null
  }

  return normalizedSymbol.toUpperCase()
}

export const normalizeStockResearchReportId = (
  reportId?: string | null,
): string | null => {
  const normalizedReportId = reportId?.trim()

  return normalizedReportId && normalizedReportId.length > 0 ? normalizedReportId : null
}

export const normalizeStockResearchReportListFilters = (
  filters?: StockResearchReportListFilters,
): NormalizedStockResearchReportListFilters => ({
  symbol: normalizeStockResearchSymbol(filters?.symbol),
  pageSize: normalizeStockResearchReportPageSize(filters?.pageSize),
})

export const normalizeStockResearchReportPageSize = (
  value?: number | string | null,
): number => {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN

  if (!Number.isFinite(numericValue) || numericValue < 1) {
    return DEFAULT_STOCK_RESEARCH_REPORT_PAGE_SIZE
  }

  return Math.floor(numericValue)
}

export const getNextStockResearchReportsPage = (
  lastPage: StockResearchReportListResponse,
  allPages: StockResearchReportListResponse[],
): number | undefined => {
  const loadedItems = allPages.reduce((total, page) => total + page.items.length, 0)

  if (typeof lastPage.total === "number" && loadedItems >= lastPage.total) {
    return undefined
  }

  if (lastPage.items.length < lastPage.page_size) {
    return undefined
  }

  return lastPage.page + 1
}
