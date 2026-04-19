import { apiClient } from "@/lib/api-client"

import type {
  AddStockWatchlistItemRequest,
  CreateStockWatchlistRequest,
  DeleteStockWatchlistResponse,
  ListStockWatchlistItemsResponse,
  ListStockWatchlistsResponse,
  RemoveStockWatchlistItemResponse,
  RenameStockWatchlistRequest,
  StockWatchlistItemResponse,
  StockWatchlistSummary,
} from "@/features/stock-watchlists/types"
import {
  normalizeStockWatchlistId,
  normalizeStockWatchlistName,
  normalizeStockWatchlistSymbol,
} from "@/features/stock-watchlists/types"

const STOCK_WATCHLISTS_ENDPOINT = "/stocks/watchlists"

const createStockWatchlist = async (
  payload: CreateStockWatchlistRequest,
): Promise<StockWatchlistSummary> => {
  const normalizedName = normalizeStockWatchlistName(payload.name)

  if (!normalizedName) {
    throw new Error("Stock watchlist creation requires a non-empty name")
  }

  const response = await apiClient.post<StockWatchlistSummary>(
    STOCK_WATCHLISTS_ENDPOINT,
    {
      name: normalizedName,
    },
  )

  return response.data
}

const listStockWatchlists = async (): Promise<ListStockWatchlistsResponse> => {
  const response = await apiClient.get<ListStockWatchlistsResponse>(
    STOCK_WATCHLISTS_ENDPOINT,
  )

  return response.data
}

const renameStockWatchlist = async (
  watchlistId: string,
  payload: RenameStockWatchlistRequest,
): Promise<StockWatchlistSummary> => {
  const normalizedWatchlistId = normalizeStockWatchlistId(watchlistId)
  const normalizedName = normalizeStockWatchlistName(payload.name)

  if (!normalizedWatchlistId) {
    throw new Error("Stock watchlist rename requires a non-empty watchlist id")
  }

  if (!normalizedName) {
    throw new Error("Stock watchlist rename requires a non-empty name")
  }

  const response = await apiClient.patch<StockWatchlistSummary>(
    `${STOCK_WATCHLISTS_ENDPOINT}/${normalizedWatchlistId}`,
    {
      name: normalizedName,
    },
  )

  return response.data
}

const deleteStockWatchlist = async (
  watchlistId: string,
): Promise<DeleteStockWatchlistResponse> => {
  const normalizedWatchlistId = normalizeStockWatchlistId(watchlistId)

  if (!normalizedWatchlistId) {
    throw new Error("Stock watchlist deletion requires a non-empty watchlist id")
  }

  const response = await apiClient.delete<DeleteStockWatchlistResponse>(
    `${STOCK_WATCHLISTS_ENDPOINT}/${normalizedWatchlistId}`,
  )

  return response.data
}

const listStockWatchlistItems = async (
  watchlistId: string,
): Promise<ListStockWatchlistItemsResponse> => {
  const normalizedWatchlistId = normalizeStockWatchlistId(watchlistId)

  if (!normalizedWatchlistId) {
    throw new Error("Stock watchlist items require a non-empty watchlist id")
  }

  const response = await apiClient.get<ListStockWatchlistItemsResponse>(
    `${STOCK_WATCHLISTS_ENDPOINT}/${normalizedWatchlistId}/items`,
  )

  return response.data
}

const addStockWatchlistItem = async (
  watchlistId: string,
  payload: AddStockWatchlistItemRequest,
): Promise<StockWatchlistItemResponse> => {
  const normalizedWatchlistId = normalizeStockWatchlistId(watchlistId)
  const normalizedSymbol = normalizeStockWatchlistSymbol(payload.symbol)

  if (!normalizedWatchlistId) {
    throw new Error("Stock watchlist add-item requires a non-empty watchlist id")
  }

  if (!normalizedSymbol) {
    throw new Error("Stock watchlist add-item requires a non-empty symbol")
  }

  const response = await apiClient.post<StockWatchlistItemResponse>(
    `${STOCK_WATCHLISTS_ENDPOINT}/${normalizedWatchlistId}/items`,
    {
      symbol: normalizedSymbol,
    },
  )

  return response.data
}

const removeStockWatchlistItem = async (
  watchlistId: string,
  symbol: string,
): Promise<RemoveStockWatchlistItemResponse> => {
  const normalizedWatchlistId = normalizeStockWatchlistId(watchlistId)
  const normalizedSymbol = normalizeStockWatchlistSymbol(symbol)

  if (!normalizedWatchlistId) {
    throw new Error("Stock watchlist remove-item requires a non-empty watchlist id")
  }

  if (!normalizedSymbol) {
    throw new Error("Stock watchlist remove-item requires a non-empty symbol")
  }

  const response = await apiClient.delete<RemoveStockWatchlistItemResponse>(
    `${STOCK_WATCHLISTS_ENDPOINT}/${normalizedWatchlistId}/items/${encodeURIComponent(normalizedSymbol)}`,
  )

  return response.data
}

export const stockWatchlistsApi = {
  addStockWatchlistItem,
  createStockWatchlist,
  deleteStockWatchlist,
  listStockWatchlistItems,
  listStockWatchlists,
  removeStockWatchlistItem,
  renameStockWatchlist,
}
