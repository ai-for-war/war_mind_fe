import {
  DEFAULT_STOCK_PAGE_SIZE,
  STOCK_EXCHANGE_OPTIONS,
  STOCK_GROUP_OPTIONS,
} from "@/features/stocks/constants"

export type StockExchangeOption = (typeof STOCK_EXCHANGE_OPTIONS)[number]["value"]
export type StockGroupOption = (typeof STOCK_GROUP_OPTIONS)[number]["value"]

export type StockListItem = {
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

export type StockListResponse = {
  items: StockListItem[]
  total: number
  page: number
  page_size: number
}

export type StockCatalogFilters = {
  q?: string | null
  exchange?: StockExchangeOption | null
  group?: StockGroupOption | null
  pageSize?: number
}

export type NormalizedStockCatalogFilters = {
  q: string | null
  exchange: StockExchangeOption | null
  group: StockGroupOption | null
  page: number
  pageSize: number
}

export const normalizeStockCatalogFilters = (
  filters?: StockCatalogFilters,
): NormalizedStockCatalogFilters => {
  const trimmedQuery = filters?.q?.trim()

  return {
    q: trimmedQuery && trimmedQuery.length > 0 ? trimmedQuery : null,
    exchange: filters?.exchange ?? null,
    group: filters?.group ?? null,
    page: 1,
    pageSize: filters?.pageSize ?? DEFAULT_STOCK_PAGE_SIZE,
  }
}

export const getNextStockCatalogPage = (
  lastPage: StockListResponse,
  allPages: StockListResponse[],
): number | undefined => {
  const loadedItems = allPages.reduce((total, page) => total + page.items.length, 0)

  if (loadedItems >= lastPage.total) {
    return undefined
  }

  return lastPage.page + 1
}
