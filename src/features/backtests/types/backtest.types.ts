export const BACKTESTS_API_PREFIX = "/backtests"
export const BACKTEST_TEMPLATE_TYPE_INTEGER = "integer"

export type BacktestTemplateParameterType = typeof BACKTEST_TEMPLATE_TYPE_INTEGER

export type BacktestTemplateParameter = {
  name: string
  type: BacktestTemplateParameterType
  required: boolean
  default: number | null
  min: number | null
  description: string | null
}

export type BacktestTemplateItem = {
  template_id: string
  display_name: string
  description: string
  parameters: BacktestTemplateParameter[]
}

export type BacktestTemplateCatalogResponse = {
  items: BacktestTemplateItem[]
}

export type BacktestTemplateParams = Record<string, number>

export type BacktestRunRequest = {
  symbol: string
  date_from: string
  date_to: string
  template_id: string
  template_params?: BacktestTemplateParams
  initial_capital?: number
}

export type NormalizedBacktestRunRequest = {
  symbol: string
  date_from: string
  date_to: string
  template_id: string
  template_params?: BacktestTemplateParams
  initial_capital?: number
}

export type BacktestRunAssumptions = {
  timeframe: string
  direction: string
  position_sizing: string
  execution_model: string
  initial_capital: number
}

export type BacktestSummaryMetrics = {
  symbol: string
  template_id: string
  timeframe: string
  date_from: string
  date_to: string
  initial_capital: number
  ending_equity: number
  total_trades: number
}

export type BacktestPerformanceMetrics = {
  total_return_pct: number
  annualized_return_pct: number
  max_drawdown_pct: number
  win_rate_pct: number
  profit_factor: number
  avg_win_pct: number
  avg_loss_pct: number
  expectancy: number
}

export type BacktestTradeLogEntry = {
  entry_time: string
  entry_price: number
  exit_time: string
  exit_price: number
  shares: number
  invested_capital: number
  pnl: number
  pnl_pct: number
  exit_reason: string
}

export type BacktestEquityCurvePoint = {
  time: string
  cash: number
  market_value: number
  equity: number
  drawdown_pct: number
  position_size: number
}

export type BacktestResult = {
  summary_metrics: BacktestSummaryMetrics
  performance_metrics: BacktestPerformanceMetrics
  trade_log: BacktestTradeLogEntry[]
  equity_curve: BacktestEquityCurvePoint[]
}

export type BacktestRunResponse = {
  result: BacktestResult
  assumptions: BacktestRunAssumptions
}

const normalizeBacktestTextValue = (value?: string | null) => {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : ""
}

export const normalizeBacktestSymbol = (symbol?: string | null) =>
  normalizeBacktestTextValue(symbol).toUpperCase()

export const normalizeBacktestTemplateId = (templateId?: string | null) =>
  normalizeBacktestTextValue(templateId).toLowerCase()

export const normalizeBacktestDate = (value?: string | null) =>
  normalizeBacktestTextValue(value)

export const normalizeBacktestTemplateParams = (
  templateParams?: BacktestTemplateParams | null,
) => {
  if (!templateParams) {
    return undefined
  }

  const normalizedEntries = Object.entries(templateParams).filter(([key, value]) => {
    if (key.trim().length === 0) {
      return false
    }

    return Number.isFinite(value)
  })

  if (normalizedEntries.length === 0) {
    return undefined
  }

  return Object.fromEntries(normalizedEntries) as BacktestTemplateParams
}

export const normalizeBacktestRunRequest = (
  request: BacktestRunRequest,
): NormalizedBacktestRunRequest => {
  const normalizedTemplateParams = normalizeBacktestTemplateParams(request.template_params)

  return {
    symbol: normalizeBacktestSymbol(request.symbol),
    date_from: normalizeBacktestDate(request.date_from),
    date_to: normalizeBacktestDate(request.date_to),
    template_id: normalizeBacktestTemplateId(request.template_id),
    ...(normalizedTemplateParams ? { template_params: normalizedTemplateParams } : {}),
    ...(typeof request.initial_capital === "number" && Number.isFinite(request.initial_capital)
      ? { initial_capital: request.initial_capital }
      : {}),
  }
}
