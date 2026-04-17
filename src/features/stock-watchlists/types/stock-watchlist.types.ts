export type StockWatchlistSummary = {
  id: string
  user_id: string
  organization_id: string
  name: string
  created_at: string
  updated_at: string
}

export type StockWatchlistStockMetadata = {
  symbol: string
  organ_name: string | null
  exchange: string | null
  groups: string[]
  industry_code: number | null
  industry_name: string | null
  source: string
  snapshot_at: string
  updated_at: string
}

export type StockWatchlistItemResponse = {
  id: string
  watchlist_id: string
  user_id: string
  organization_id: string
  symbol: string
  saved_at: string
  updated_at: string
  stock: StockWatchlistStockMetadata | null
}

export type CreateStockWatchlistRequest = {
  name: string
}

export type RenameStockWatchlistRequest = {
  name: string
}

export type AddStockWatchlistItemRequest = {
  symbol: string
}

export type ListStockWatchlistsResponse = {
  items: StockWatchlistSummary[]
}

export type ListStockWatchlistItemsResponse = {
  watchlist: StockWatchlistSummary
  items: StockWatchlistItemResponse[]
}

export type DeleteStockWatchlistResponse = {
  id: string
  deleted: boolean
}

export type RemoveStockWatchlistItemResponse = {
  watchlist_id: string
  symbol: string
  removed: boolean
}

export type RenameStockWatchlistMutationInput = {
  watchlistId: string
  payload: RenameStockWatchlistRequest
}

export type DeleteStockWatchlistMutationInput = {
  watchlistId: string
}

export type AddStockWatchlistItemMutationInput = {
  watchlistId: string
  payload: AddStockWatchlistItemRequest
}

export type RemoveStockWatchlistItemMutationInput = {
  watchlistId: string
  symbol: string
}

export const normalizeStockWatchlistId = (
  watchlistId?: string | null,
): string | null => {
  const normalizedWatchlistId = watchlistId?.trim()

  return normalizedWatchlistId && normalizedWatchlistId.length > 0
    ? normalizedWatchlistId
    : null
}

export const normalizeStockWatchlistName = (
  name?: string | null,
): string | null => {
  const normalizedName = name?.trim()

  return normalizedName && normalizedName.length > 0 ? normalizedName : null
}

export const normalizeStockWatchlistSymbol = (
  symbol?: string | null,
): string | null => {
  const normalizedSymbol = symbol?.trim()

  return normalizedSymbol && normalizedSymbol.length > 0 ? normalizedSymbol : null
}
