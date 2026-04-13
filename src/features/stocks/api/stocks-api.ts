import { apiClient } from "@/lib/api-client"

import type {
  NormalizedStockCatalogFilters,
  StockCompanyOfficersFilter,
  StockCompanyOfficersResponse,
  StockCompanyOverviewResponse,
  StockCompanyShareholdersResponse,
  StockCompanySubsidiariesFilter,
  StockCompanySubsidiariesResponse,
  StockListResponse,
} from "@/features/stocks/types"
import {
  normalizeStockCompanyOfficersFilter,
  normalizeStockCompanySubsidiariesFilter,
  normalizeStockCompanySymbol,
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

const getStockCompanyOverview = async (
  symbol: string,
): Promise<StockCompanyOverviewResponse> => {
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)

  if (!normalizedSymbol) {
    throw new Error("Stock company overview requires a non-empty symbol")
  }

  const response = await apiClient.get<StockCompanyOverviewResponse>(
    `${STOCKS_ENDPOINT}/${normalizedSymbol}/company/overview`,
  )

  return response.data
}

const getStockCompanyShareholders = async (
  symbol: string,
): Promise<StockCompanyShareholdersResponse> => {
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)

  if (!normalizedSymbol) {
    throw new Error("Stock company shareholders requires a non-empty symbol")
  }

  const response = await apiClient.get<StockCompanyShareholdersResponse>(
    `${STOCKS_ENDPOINT}/${normalizedSymbol}/company/shareholders`,
  )

  return response.data
}

const getStockCompanyOfficers = async (
  symbol: string,
  filterBy?: StockCompanyOfficersFilter,
): Promise<StockCompanyOfficersResponse> => {
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const normalizedFilter = normalizeStockCompanyOfficersFilter(filterBy)

  if (!normalizedSymbol) {
    throw new Error("Stock company officers requires a non-empty symbol")
  }

  const response = await apiClient.get<StockCompanyOfficersResponse>(
    `${STOCKS_ENDPOINT}/${normalizedSymbol}/company/officers`,
    {
      params: {
        filter_by: normalizedFilter,
      },
    },
  )

  return response.data
}

const getStockCompanySubsidiaries = async (
  symbol: string,
  filterBy?: StockCompanySubsidiariesFilter,
): Promise<StockCompanySubsidiariesResponse> => {
  const normalizedSymbol = normalizeStockCompanySymbol(symbol)
  const normalizedFilter = normalizeStockCompanySubsidiariesFilter(filterBy)

  if (!normalizedSymbol) {
    throw new Error("Stock company subsidiaries requires a non-empty symbol")
  }

  const response = await apiClient.get<StockCompanySubsidiariesResponse>(
    `${STOCKS_ENDPOINT}/${normalizedSymbol}/company/subsidiaries`,
    {
      params: {
        filter_by: normalizedFilter,
      },
    },
  )

  return response.data
}

export const stocksApi = {
  getStockCatalog,
  getStockCompanyOfficers,
  getStockCompanyOverview,
  getStockCompanyShareholders,
  getStockCompanySubsidiaries,
}
