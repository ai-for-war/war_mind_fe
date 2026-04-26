import { apiClient } from "@/lib/api-client"

import type {
  StockResearchCatalogResponse,
  StockResearchReportCreateRequest,
  StockResearchReportCreateResponse,
  StockResearchReportListFilters,
  StockResearchReportListResponse,
  StockResearchReportResponse,
  StockResearchScheduleCreateRequest,
  StockResearchScheduleDeleteResponse,
  StockResearchScheduleListFilters,
  StockResearchScheduleListResponse,
  StockResearchScheduleResponse,
  StockResearchScheduleUpdateRequest,
} from "@/features/stock-research/types"
import {
  normalizeStockResearchReportId,
  normalizeStockResearchReportListFilters,
  normalizeStockResearchSymbol,
} from "@/features/stock-research/types"
import {
  buildStockResearchScheduleDefinitionRequest,
  normalizeStockResearchRuntimeConfig,
  normalizeStockResearchScheduleId,
  normalizeStockResearchScheduleListFilters,
} from "@/features/stock-research/stock-research-schedules.utils"

const STOCK_RESEARCH_REPORTS_ENDPOINT = "/stock-research/reports"
const STOCK_RESEARCH_SCHEDULES_ENDPOINT = "/stock-research/schedules"

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
  filters?: StockResearchReportListFilters & { page?: number | null },
): Promise<StockResearchReportListResponse> => {
  const normalizedFilters = normalizeStockResearchReportListFilters(filters)
  const page =
    typeof filters?.page === "number" && Number.isFinite(filters.page) && filters.page >= 1
      ? Math.floor(filters.page)
      : 1

  const response = await apiClient.get<StockResearchReportListResponse>(
    STOCK_RESEARCH_REPORTS_ENDPOINT,
    {
      params: {
        ...(normalizedFilters.symbol ? { symbol: normalizedFilters.symbol } : {}),
        page,
        page_size: normalizedFilters.pageSize,
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

const listStockResearchSchedules = async (
  filters?: StockResearchScheduleListFilters & { page?: number | null },
): Promise<StockResearchScheduleListResponse> => {
  const normalizedFilters = normalizeStockResearchScheduleListFilters(filters)
  const page =
    typeof filters?.page === "number" && Number.isFinite(filters.page) && filters.page >= 1
      ? Math.floor(filters.page)
      : 1

  const response = await apiClient.get<StockResearchScheduleListResponse>(
    STOCK_RESEARCH_SCHEDULES_ENDPOINT,
    {
      params: {
        page,
        page_size: normalizedFilters.pageSize,
      },
    },
  )

  return response.data
}

const getStockResearchSchedule = async (
  scheduleId: string,
): Promise<StockResearchScheduleResponse> => {
  const normalizedScheduleId = normalizeStockResearchScheduleId(scheduleId)

  if (!normalizedScheduleId) {
    throw new Error("Stock research schedule detail requires a non-empty schedule id")
  }

  const response = await apiClient.get<StockResearchScheduleResponse>(
    `${STOCK_RESEARCH_SCHEDULES_ENDPOINT}/${normalizedScheduleId}`,
  )

  return response.data
}

const createStockResearchSchedule = async (
  payload: StockResearchScheduleCreateRequest,
): Promise<StockResearchScheduleResponse> => {
  const normalizedSymbol = normalizeStockResearchSymbol(payload.symbol)
  const runtimeConfig = normalizeStockResearchRuntimeConfig(payload.runtime_config)
  const schedule = buildStockResearchScheduleDefinitionRequest(payload.schedule)

  if (!normalizedSymbol) {
    throw new Error("Stock research schedule creation requires a non-empty symbol")
  }

  if (!runtimeConfig) {
    throw new Error("Stock research schedule creation requires a provider and model")
  }

  if (!schedule) {
    throw new Error("Stock research schedule creation requires a valid schedule definition")
  }

  const response = await apiClient.post<StockResearchScheduleResponse>(
    STOCK_RESEARCH_SCHEDULES_ENDPOINT,
    {
      symbol: normalizedSymbol,
      runtime_config: runtimeConfig,
      schedule,
    },
  )

  return response.data
}

const updateStockResearchSchedule = async (
  scheduleId: string,
  payload: StockResearchScheduleUpdateRequest,
): Promise<StockResearchScheduleResponse> => {
  const normalizedScheduleId = normalizeStockResearchScheduleId(scheduleId)

  if (!normalizedScheduleId) {
    throw new Error("Stock research schedule update requires a non-empty schedule id")
  }

  const updatePayload: StockResearchScheduleUpdateRequest = {}

  if (typeof payload.symbol !== "undefined") {
    const normalizedSymbol =
      payload.symbol === null ? null : normalizeStockResearchSymbol(payload.symbol)

    if (payload.symbol !== null && !normalizedSymbol) {
      throw new Error("Stock research schedule update requires a non-empty symbol")
    }

    updatePayload.symbol = normalizedSymbol
  }

  if (typeof payload.runtime_config !== "undefined") {
    const runtimeConfig =
      payload.runtime_config === null
        ? null
        : normalizeStockResearchRuntimeConfig(payload.runtime_config)

    if (payload.runtime_config !== null && !runtimeConfig) {
      throw new Error("Stock research schedule update requires a provider and model")
    }

    updatePayload.runtime_config = runtimeConfig
  }

  if (typeof payload.schedule !== "undefined") {
    const schedule =
      payload.schedule === null
        ? null
        : buildStockResearchScheduleDefinitionRequest(payload.schedule)

    if (payload.schedule !== null && !schedule) {
      throw new Error("Stock research schedule update requires a valid schedule definition")
    }

    updatePayload.schedule = schedule
  }

  if (typeof payload.status !== "undefined") {
    updatePayload.status = payload.status
  }

  const response = await apiClient.patch<StockResearchScheduleResponse>(
    `${STOCK_RESEARCH_SCHEDULES_ENDPOINT}/${normalizedScheduleId}`,
    updatePayload,
  )

  return response.data
}

const pauseStockResearchSchedule = async (
  scheduleId: string,
): Promise<StockResearchScheduleResponse> => {
  const normalizedScheduleId = normalizeStockResearchScheduleId(scheduleId)

  if (!normalizedScheduleId) {
    throw new Error("Stock research schedule pause requires a non-empty schedule id")
  }

  const response = await apiClient.post<StockResearchScheduleResponse>(
    `${STOCK_RESEARCH_SCHEDULES_ENDPOINT}/${normalizedScheduleId}/pause`,
  )

  return response.data
}

const resumeStockResearchSchedule = async (
  scheduleId: string,
): Promise<StockResearchScheduleResponse> => {
  const normalizedScheduleId = normalizeStockResearchScheduleId(scheduleId)

  if (!normalizedScheduleId) {
    throw new Error("Stock research schedule resume requires a non-empty schedule id")
  }

  const response = await apiClient.post<StockResearchScheduleResponse>(
    `${STOCK_RESEARCH_SCHEDULES_ENDPOINT}/${normalizedScheduleId}/resume`,
  )

  return response.data
}

const deleteStockResearchSchedule = async (
  scheduleId: string,
): Promise<StockResearchScheduleDeleteResponse> => {
  const normalizedScheduleId = normalizeStockResearchScheduleId(scheduleId)

  if (!normalizedScheduleId) {
    throw new Error("Stock research schedule deletion requires a non-empty schedule id")
  }

  const response = await apiClient.delete<StockResearchScheduleDeleteResponse>(
    `${STOCK_RESEARCH_SCHEDULES_ENDPOINT}/${normalizedScheduleId}`,
  )

  return response.data
}

export const stockResearchApi = {
  createStockResearchSchedule,
  createStockResearchReport,
  deleteStockResearchSchedule,
  getStockResearchCatalog,
  getStockResearchReport,
  getStockResearchSchedule,
  listStockResearchReports,
  listStockResearchSchedules,
  pauseStockResearchSchedule,
  resumeStockResearchSchedule,
  updateStockResearchSchedule,
}
