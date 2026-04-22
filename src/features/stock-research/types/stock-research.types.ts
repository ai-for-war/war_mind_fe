export type StockResearchReportStatus =
  | "queued"
  | "running"
  | "completed"
  | "partial"
  | "failed"

export type StockResearchRuntimeConfig = {
  provider: string
  model: string
  reasoning?: string | null
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
}

export type NormalizedStockResearchReportListFilters = {
  symbol: string | null
}

export type StockResearchReportListResponse = {
  items: StockResearchReportSummary[]
}

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
})
