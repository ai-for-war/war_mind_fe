import { apiClient } from "@/lib/api-client"

import type {
  NormalizedStockCatalogFilters,
  StockListResponse,
} from "@/features/stocks/types"

const STOCKS_ENDPOINT = "/api/v1/stocks"

const getStockCatalog = async (
  filters: NormalizedStockCatalogFilters,
): Promise<StockListResponse> => {
  const response = await apiClient.get<StockListResponse>(STOCKS_ENDPOINT, {
    params: {
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.exchange ? { exchange: filters.exchange } : {}),
      ...(filters.group ? { group: filters.group } : {}),
      page: filters.page,
      page_size: filters.pageSize,
    },
  })

  return response.data
}

export const stocksApi = {
  getStockCatalog,
}
