import { isAxiosError } from "axios"

import type { StockListItem } from "@/features/stocks/types"
import type { StockWatchlistStockMetadata } from "@/features/stock-watchlists/types"
import { formatAbsoluteDateTime } from "@/lib/date"
import type { ApiErrorResponse } from "@/types/api"

const DEFAULT_STOCK_WATCHLIST_ERROR_MESSAGE =
  "Something went wrong while processing the stock watchlist request."

export const getStockWatchlistApiErrorMessage = (
  error: unknown,
  fallback = DEFAULT_STOCK_WATCHLIST_ERROR_MESSAGE,
) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ")
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export const getStockWatchlistApiStatus = (error: unknown): number | null => {
  if (isAxiosError(error)) {
    return error.response?.status ?? null
  }

  return null
}

export const formatStockWatchlistValue = (
  value: string | number | null | undefined,
  fallback = "--",
): string => {
  if (value == null) {
    return fallback
  }

  const normalizedValue = `${value}`.trim()

  return normalizedValue.length > 0 ? normalizedValue : fallback
}

export const formatStockWatchlistDateTime = (
  value: string | null | undefined,
  fallback = "--",
) => {
  const normalizedValue = value?.trim()

  return normalizedValue ? formatAbsoluteDateTime(normalizedValue, fallback) : fallback
}

export const mapWatchlistStockMetadataToStockListItem = (
  stock: StockWatchlistStockMetadata,
): StockListItem => ({
  exchange: stock.exchange,
  groups: stock.groups,
  industry_code: stock.industry_code,
  industry_name: stock.industry_name,
  organ_name: stock.organ_name,
  snapshot_at: stock.snapshot_at,
  source: stock.source,
  symbol: stock.symbol,
  updated_at: stock.updated_at,
})
