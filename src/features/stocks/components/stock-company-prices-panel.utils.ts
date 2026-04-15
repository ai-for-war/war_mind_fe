import { format, subDays } from "date-fns"

import { type BusinessDay, type CandlestickData, type HistogramData, type Time, type UTCTimestamp } from "lightweight-charts"

import { parseDateValue } from "@/features/stocks/components/stock-company-dialog.utils"
import type { StockPriceHistoryItem, StockPriceIntradayItem } from "@/features/stocks/types"

export type PricesView = "intraday" | "ohlcv"
export type HistoryQueryMode = "lookback" | "range"

export type ParsedCandleDatum = CandlestickData<Time> & {
  volume: number | null
}

export const LOOKBACK_LENGTH_OPTIONS = [30, 60, 120, 250, 500] as const
export const INTRADAY_PAGE_SIZE_OPTIONS = [100, 500, 1000, 5000] as const

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/

export const formatMetricNumber = (
  value: number | null | undefined,
  maximumFractionDigits = 2,
): string => {
  if (value == null || Number.isNaN(value)) {
    return "--"
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value)
}

export const formatMetricSignedValue = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) {
    return "--"
  }

  const formattedValue = formatMetricNumber(Math.abs(value))
  const signPrefix = value > 0 ? "+" : value < 0 ? "-" : ""

  return `${signPrefix}${formattedValue}`
}

export const formatMetricSignedPercent = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) {
    return "--"
  }

  const formattedValue = formatMetricNumber(Math.abs(value))
  const signPrefix = value > 0 ? "+" : value < 0 ? "-" : ""

  return `${signPrefix}${formattedValue}%`
}

export const getMetricAccent = (
  value: number | null | undefined,
): "negative" | "neutral" | "positive" => {
  if (value == null || Number.isNaN(value) || value === 0) {
    return "neutral"
  }

  return value > 0 ? "positive" : "negative"
}

export const createDefaultRangeDraft = () => {
  const today = new Date()

  return {
    end: format(today, "yyyy-MM-dd"),
    start: format(subDays(today, 30), "yyyy-MM-dd"),
  }
}

const formatVietnamDateTime = (
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string => {
  if (!value) {
    return "--"
  }

  const timestamp = getVietnamTimestamp(value)

  if (timestamp == null) {
    return value
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    ...options,
  }).format(new Date(timestamp))
}

export const formatHistoryTimeLabel = (value: string | null | undefined): string => {
  if (!value) {
    return "--"
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number)

    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
    }).format(new Date(Date.UTC(year, month - 1, day)))
  }

  return formatVietnamDateTime(value, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const formatIntradayTimeLabel = (value: string | null | undefined): string =>
  formatVietnamDateTime(value, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "short",
  })

export const getVietnamTimestamp = (value: string | null | undefined): number | null => {
  if (!value) {
    return null
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number)

    return Date.UTC(year, month - 1, day)
  }

  const datetimeMatch = value.match(DATETIME_PATTERN)

  if (datetimeMatch) {
    const [, year, month, day, hour, minute, second = "0"] = datetimeMatch

    return Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour) - 7,
      Number(minute),
      Number(second),
    )
  }

  return parseDateValue(value)
}

export const toChartTime = (value: string | null | undefined): Time | null => {
  if (!value) {
    return null
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split("-").map(Number)

    return {
      day,
      month,
      year,
    } satisfies BusinessDay
  }

  const timestamp = getVietnamTimestamp(value)

  if (timestamp == null) {
    return null
  }

  return Math.floor(timestamp / 1000) as UTCTimestamp
}

export const buildParsedCandles = (items: StockPriceHistoryItem[]): ParsedCandleDatum[] =>
  items.flatMap((item) => {
    const chartTime = toChartTime(item.time)

    if (
      chartTime == null ||
      item.open == null ||
      item.high == null ||
      item.low == null ||
      item.close == null
    ) {
      return []
    }

    return [
      {
        close: item.close,
        high: item.high,
        low: item.low,
        open: item.open,
        time: chartTime,
        volume: item.volume,
      },
    ]
  })

export const buildVolumeData = (items: ParsedCandleDatum[]): HistogramData<Time>[] =>
  items.flatMap((item) => {
    if (item.volume == null) {
      return []
    }

    return [
      {
        color: item.close >= item.open ? "rgba(16, 185, 129, 0.75)" : "rgba(248, 113, 113, 0.7)",
        time: item.time,
        value: item.volume,
      },
    ]
  })

export const getIntradayItemKey = (item: StockPriceIntradayItem, index: number) =>
  `${item.id ?? "intraday"}-${item.time ?? "unknown"}-${index}`

export const dedupeIntradayItems = (items: StockPriceIntradayItem[]): StockPriceIntradayItem[] => {
  const seenKeys = new Set<string>()

  return items.filter((item) => {
    const dedupeKey = `${item.id ?? ""}|${item.time ?? ""}|${item.price ?? ""}|${item.volume ?? ""}`

    if (seenKeys.has(dedupeKey)) {
      return false
    }

    seenKeys.add(dedupeKey)

    return true
  })
}
