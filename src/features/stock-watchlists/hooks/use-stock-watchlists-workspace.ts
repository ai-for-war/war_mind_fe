import { useMemo, useState } from "react"

import { useStockWatchlistItems } from "@/features/stock-watchlists/hooks/use-stock-watchlist-items"
import { useStockWatchlists } from "@/features/stock-watchlists/hooks/use-stock-watchlists"
import { normalizeStockWatchlistId } from "@/features/stock-watchlists/types"

export const useStockWatchlistsWorkspace = () => {
  const watchlistsQuery = useStockWatchlists()
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null)
  const normalizedSelectedWatchlistId = normalizeStockWatchlistId(selectedWatchlistId)
  const normalizedActiveWatchlistId = useMemo(() => {
    const hasSelectedWatchlist = watchlistsQuery.items.some(
      (watchlist) => watchlist.id === normalizedSelectedWatchlistId,
    )

    if (hasSelectedWatchlist) {
      return normalizedSelectedWatchlistId
    }

    return watchlistsQuery.items[0]?.id ?? null
  }, [normalizedSelectedWatchlistId, watchlistsQuery.items])
  const activeWatchlist = useMemo(
    () =>
      watchlistsQuery.items.find(
        (watchlist) => watchlist.id === normalizedActiveWatchlistId,
      ) ?? null,
    [normalizedActiveWatchlistId, watchlistsQuery.items],
  )

  const activeWatchlistItemsQuery = useStockWatchlistItems({
    watchlistId: normalizedActiveWatchlistId,
  })

  const handleActiveWatchlistChange = (watchlistId: string) => {
    setSelectedWatchlistId(normalizeStockWatchlistId(watchlistId))
  }

  return {
    activeWatchlist,
    activeWatchlistId: normalizedActiveWatchlistId,
    activeWatchlistItemsQuery,
    setActiveWatchlistId: handleActiveWatchlistChange,
    watchlistsQuery,
  }
}
