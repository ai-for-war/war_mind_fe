export const STOCK_PRICE_HISTORY_INTERVALS = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1H",
  "1D",
  "1W",
  "1M",
] as const

export type StockPriceHistoryInterval = (typeof STOCK_PRICE_HISTORY_INTERVALS)[number]

export type StockPriceResponseBase = {
  cache_hit: boolean
  source: "VCI"
  symbol: string
}

export type StockPriceHistoryItem = {
  time: string | null
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
}

export type StockPriceHistoryResponse = StockPriceResponseBase & {
  interval: StockPriceHistoryInterval
  items: StockPriceHistoryItem[]
}

export type StockPriceIntradayItem = {
  time: string | null
  price: number | null
  volume: number | null
  match_type: string | null
  id: number | null
}

export type StockPriceIntradayResponse = StockPriceResponseBase & {
  items: StockPriceIntradayItem[]
}

export type StockPriceHistoryRangeQuery = {
  end?: string | null
  interval?: StockPriceHistoryInterval | null
  start: string
}

export type StockPriceHistoryLookbackQuery = {
  interval?: StockPriceHistoryInterval | null
  length: number
}

export type StockPriceHistoryQuery =
  | StockPriceHistoryLookbackQuery
  | StockPriceHistoryRangeQuery

export type StockPriceIntradayQuery = {
  lastTime?: string | null
  lastTimeFormat?: string | null
  pageSize?: number | null
}

export const DEFAULT_STOCK_PRICE_HISTORY_INTERVAL: StockPriceHistoryInterval = "1D"
export const DEFAULT_STOCK_PRICE_LOOKBACK_LENGTH = 500
export const DEFAULT_STOCK_PRICE_INTRADAY_PAGE_SIZE = 100

const STOCK_PRICE_INTRADAY_SPACE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
const STOCK_PRICE_INTRADAY_ISO_NO_OFFSET_PATTERN =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})(?:\.\d+)?$/
const STOCK_PRICE_INTRADAY_ISO_OFFSET_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/

export const normalizeStockPriceHistoryInterval = (
  interval?: string | null,
): StockPriceHistoryInterval => {
  if (interval && STOCK_PRICE_HISTORY_INTERVALS.includes(interval as StockPriceHistoryInterval)) {
    return interval as StockPriceHistoryInterval
  }

  return DEFAULT_STOCK_PRICE_HISTORY_INTERVAL
}

export const normalizeStockPriceLookbackLength = (value?: number | string | null): number => {
  const parsedValue = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_STOCK_PRICE_LOOKBACK_LENGTH
  }

  return Math.floor(parsedValue)
}

export const normalizeStockPriceIntradayPageSize = (value?: number | string | null): number => {
  const parsedValue = typeof value === "number" ? value : Number(value)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return DEFAULT_STOCK_PRICE_INTRADAY_PAGE_SIZE
  }

  return Math.min(30000, Math.floor(parsedValue))
}

export const normalizeStockPriceIntradayCursor = (
  value?: string | null,
): {
  lastTime: string | null
  lastTimeFormat?: string
} => {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return {
      lastTime: null,
    }
  }

  if (STOCK_PRICE_INTRADAY_SPACE_TIME_PATTERN.test(trimmedValue)) {
    return {
      lastTime: trimmedValue,
    }
  }

  const isoWithoutOffsetMatch = trimmedValue.match(STOCK_PRICE_INTRADAY_ISO_NO_OFFSET_PATTERN)

  if (isoWithoutOffsetMatch) {
    return {
      lastTime: `${isoWithoutOffsetMatch[1]} ${isoWithoutOffsetMatch[2]}`,
    }
  }

  if (STOCK_PRICE_INTRADAY_ISO_OFFSET_PATTERN.test(trimmedValue) || trimmedValue.includes("T")) {
    return {
      lastTime: trimmedValue,
      lastTimeFormat: "%Y-%m-%dT%H:%M:%S%z",
    }
  }

  return {
    lastTime: trimmedValue,
  }
}
