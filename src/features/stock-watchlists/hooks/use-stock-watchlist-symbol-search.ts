import { useStockSymbolSearch } from "@/features/stocks/hooks"

type UseStockWatchlistSymbolSearchOptions = {
  isEnabled?: boolean
  pageSize?: number
  query?: string | null
}

const DEFAULT_SYMBOL_SEARCH_PAGE_SIZE = 10

export const useStockWatchlistSymbolSearch = ({
  isEnabled = true,
  pageSize = DEFAULT_SYMBOL_SEARCH_PAGE_SIZE,
  query,
}: UseStockWatchlistSymbolSearchOptions) =>
  useStockSymbolSearch({
    isEnabled,
    pageSize,
    query,
  })
