import { apiClient } from "@/lib/api-client"

import type {
  StockResearchCatalogResponse,
  StockResearchReportCreateRequest,
  StockResearchReportCreateResponse,
  StockResearchReportListFilters,
  StockResearchReportListResponse,
  StockResearchReportResponse,
} from "@/features/stock-research/types"
import {
  normalizeStockResearchReportId,
  normalizeStockResearchReportListFilters,
  normalizeStockResearchSymbol,
} from "@/features/stock-research/types"

const STOCK_RESEARCH_REPORTS_ENDPOINT = "/stock-research/reports"

const getStockResearchCatalog = async (): Promise<StockResearchCatalogResponse> => {
  const response = await apiClient.get<StockResearchCatalogResponse>(
    `${STOCK_RESEARCH_REPORTS_ENDPOINT}/catalog`,
  )

  return response.data
}

const createStockResearchReport = async (
  payload: StockResearchReportCreateRequest,
): Promise<StockResearchReportCreateResponse> => {
  const normalizedSymbol = normalizeStockResearchSymbol(payload.symbol)

  if (!normalizedSymbol) {
    throw new Error("Stock research report creation requires a non-empty symbol")
  }

  const runtimeConfig = payload.runtime_config

  if (runtimeConfig == null) {
    const response = await apiClient.post<StockResearchReportCreateResponse>(
      STOCK_RESEARCH_REPORTS_ENDPOINT,
      {
        symbol: normalizedSymbol,
      },
    )

    return response.data
  }

  const provider = runtimeConfig.provider?.trim()
  const model = runtimeConfig.model?.trim()

  if (!provider) {
    throw new Error("Stock research report creation requires a provider when runtime override is set")
  }

  if (!model) {
    throw new Error("Stock research report creation requires a model when runtime override is set")
  }

  const response = await apiClient.post<StockResearchReportCreateResponse>(
    STOCK_RESEARCH_REPORTS_ENDPOINT,
    {
      symbol: normalizedSymbol,
      runtime_config: {
        provider,
        model,
        reasoning: runtimeConfig.reasoning ?? null,
      },
    },
  )

  return response.data
}

const listStockResearchReports = async (
  filters?: StockResearchReportListFilters,
): Promise<StockResearchReportListResponse> => {
  const normalizedFilters = normalizeStockResearchReportListFilters(filters)

  const response = await apiClient.get<StockResearchReportListResponse>(
    STOCK_RESEARCH_REPORTS_ENDPOINT,
    {
      params: {
        ...(normalizedFilters.symbol ? { symbol: normalizedFilters.symbol } : {}),
      },
    },
  )

  return response.data
}

const getStockResearchReport = async (
  reportId: string,
): Promise<StockResearchReportResponse> => {
  const normalizedReportId = normalizeStockResearchReportId(reportId)

  if (!normalizedReportId) {
    throw new Error("Stock research report detail requires a non-empty report id")
  }

  const response = await apiClient.get<StockResearchReportResponse>(
    `${STOCK_RESEARCH_REPORTS_ENDPOINT}/${normalizedReportId}`,
  )

  return response.data
}

export const stockResearchApi = {
  createStockResearchReport,
  getStockResearchCatalog,
  getStockResearchReport,
  listStockResearchReports,
}
