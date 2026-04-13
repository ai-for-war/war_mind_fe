import { apiClient } from "@/lib/api-client"

import type {
  NormalizedStockCatalogFilters,
  StockListResponse,
} from "@/features/stocks/types"

const STOCKS_ENDPOINT = "/stocks"
const API_EXCHANGE_PARAM_MAP: Record<string, string> = {
  HOSE: "HSX",
}

const getStockCatalog = async (
  filters: NormalizedStockCatalogFilters,
): Promise<StockListResponse> => {
  const response = await apiClient.get<StockListResponse>(STOCKS_ENDPOINT, {
    params: {
      ...(filters.q ? { q: filters.q } : {}),
      ...(filters.exchange
        ? { exchange: API_EXCHANGE_PARAM_MAP[filters.exchange] ?? filters.exchange }
        : {}),
      ...(filters.group ? { group: filters.group } : {}),
      ...(filters.industryCode != null ? { industry_code: filters.industryCode } : {}),
      page: filters.page,
      page_size: filters.pageSize,
    },
  })

  return response.data
}

export const stocksApi = {
  getStockCatalog,
}
