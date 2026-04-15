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
export const DEFAULT_STOCK_PRICE_LOOKBACK_LENGTH = 120
export const DEFAULT_STOCK_PRICE_INTRADAY_PAGE_SIZE = 100

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
