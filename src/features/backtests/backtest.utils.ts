import { isAxiosError } from "axios"

import type {
  BacktestEquityCurvePoint,
  BacktestRunRequest,
  BacktestTemplateItem,
  BacktestTradeLogEntry,
} from "@/features/backtests/types"
import { normalizeBacktestTemplateId } from "@/features/backtests/types"
import type { ApiErrorResponse, ValidationError } from "@/types/api"

export type BacktestChartPoint = {
  time: string
  cash: number
  marketValue: number
  equity: number
  drawdownPct: number
  positionSize: number
}

export type BacktestTradeRow = BacktestTradeLogEntry & {
  id: string
}

export type BacktestTemplateParameterDefaults = Record<string, number>

export type BacktestFieldErrorMap = Record<string, string[]>

const DEFAULT_BACKTEST_ERROR_MESSAGE =
  "Something went wrong while processing the backtest request."

const formatSignedValue = (value: number, formatter: Intl.NumberFormat) => {
  if (Object.is(value, -0)) {
    return formatter.format(0)
  }

  return formatter.format(value)
}

export const formatBacktestCurrency = (
  value: number,
  options?: {
    currency?: string
    locale?: string
    maximumFractionDigits?: number
  },
) => {
  const formatter = new Intl.NumberFormat(options?.locale ?? "vi-VN", {
    style: "currency",
    currency: options?.currency ?? "VND",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  })

  return formatSignedValue(value, formatter)
}

export const formatBacktestCompactCurrency = (
  value: number,
  options?: {
    currency?: string
    locale?: string
    maximumFractionDigits?: number
  },
) => {
  const formatter = new Intl.NumberFormat(options?.locale ?? "vi-VN", {
    style: "currency",
    currency: options?.currency ?? "VND",
    notation: "compact",
    maximumFractionDigits: options?.maximumFractionDigits ?? 1,
  })

  return formatSignedValue(value, formatter)
}

export const formatBacktestNumber = (
  value: number,
  options?: {
    locale?: string
    maximumFractionDigits?: number
    minimumFractionDigits?: number
  },
) => {
  const formatter = new Intl.NumberFormat(options?.locale ?? "en-US", {
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
  })

  return formatSignedValue(value, formatter)
}

export const formatBacktestPercent = (
  value: number,
  options?: {
    locale?: string
    maximumFractionDigits?: number
  },
) => {
  const formatter = new Intl.NumberFormat(options?.locale ?? "en-US", {
    style: "percent",
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  })

  return formatter.format(value / 100)
}

export const buildBacktestEquityChartData = (
  equityCurve: BacktestEquityCurvePoint[],
): BacktestChartPoint[] =>
  equityCurve.map((point) => ({
    time: point.time,
    cash: point.cash,
    marketValue: point.market_value,
    equity: point.equity,
    drawdownPct: point.drawdown_pct,
    positionSize: point.position_size,
  }))

export const buildBacktestTradeRows = (
  tradeLog: BacktestTradeLogEntry[],
): BacktestTradeRow[] =>
  tradeLog.map((entry, index) => ({
    ...entry,
    id: `${entry.entry_time}-${entry.exit_time}-${index}`,
  }))

export const getBacktestTemplateById = (
  templates: BacktestTemplateItem[],
  templateId?: string | null,
) => {
  const normalizedTemplateId = normalizeBacktestTemplateId(templateId)

  return templates.find((template) => normalizeBacktestTemplateId(template.template_id) === normalizedTemplateId)
}

export const buildBacktestTemplateParameterDefaults = (
  template?: BacktestTemplateItem | null,
): BacktestTemplateParameterDefaults => {
  if (!template) {
    return {}
  }

  return template.parameters.reduce<BacktestTemplateParameterDefaults>((defaults, parameter) => {
    if (typeof parameter.default === "number" && Number.isFinite(parameter.default)) {
      defaults[parameter.name] = parameter.default
    }

    return defaults
  }, {})
}

export const getBacktestRunPreviewLabel = (request: Partial<BacktestRunRequest>) => {
  const normalizedSymbol = request.symbol?.trim().toUpperCase()
  const normalizedTemplateId = normalizeBacktestTemplateId(request.template_id)

  if (!normalizedSymbol || !normalizedTemplateId) {
    return "Backtest run"
  }

  return `${normalizedSymbol} · ${normalizedTemplateId}`
}

export const getBacktestValidationErrors = (error: unknown): ValidationError[] => {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return []
  }

  const detail = error.response?.data?.detail

  return Array.isArray(detail) ? detail : []
}

export const getBacktestFieldErrorPath = (validationError: ValidationError) => {
  const [, ...fieldSegments] = validationError.loc

  return fieldSegments.join(".")
}

export const getBacktestValidationErrorMap = (
  validationErrors: ValidationError[],
): BacktestFieldErrorMap =>
  validationErrors.reduce<BacktestFieldErrorMap>((errorMap, validationError) => {
    const fieldPath = getBacktestFieldErrorPath(validationError)

    if (!fieldPath) {
      return errorMap
    }

    if (!errorMap[fieldPath]) {
      errorMap[fieldPath] = []
    }

    errorMap[fieldPath].push(validationError.msg)

    return errorMap
  }, {})

export const getBacktestApiErrorMessage = (error: unknown) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item.msg).join(", ")
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return DEFAULT_BACKTEST_ERROR_MESSAGE
}
