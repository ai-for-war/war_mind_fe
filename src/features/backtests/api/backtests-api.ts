import { apiClient } from "@/lib/api-client"

import type {
  BacktestRunRequest,
  BacktestRunResponse,
  BacktestTemplateCatalogResponse,
} from "@/features/backtests/types"
import {
  BACKTESTS_API_PREFIX,
  normalizeBacktestRunRequest,
} from "@/features/backtests/types"

const BACKTEST_TEMPLATES_ENDPOINT = `${BACKTESTS_API_PREFIX}/templates`
const BACKTEST_RUN_ENDPOINT = `${BACKTESTS_API_PREFIX}/run`

const getBacktestTemplates = async (): Promise<BacktestTemplateCatalogResponse> => {
  const response = await apiClient.get<BacktestTemplateCatalogResponse>(BACKTEST_TEMPLATES_ENDPOINT)

  return response.data
}

const runBacktest = async (
  request: BacktestRunRequest,
): Promise<BacktestRunResponse> => {
  const normalizedRequest = normalizeBacktestRunRequest(request)

  if (!normalizedRequest.symbol) {
    throw new Error("Backtest run requires a non-empty symbol")
  }

  if (!normalizedRequest.date_from) {
    throw new Error("Backtest run requires a non-empty start date")
  }

  if (!normalizedRequest.date_to) {
    throw new Error("Backtest run requires a non-empty end date")
  }

  if (!normalizedRequest.template_id) {
    throw new Error("Backtest run requires a selected strategy template")
  }

  const response = await apiClient.post<BacktestRunResponse>(BACKTEST_RUN_ENDPOINT, normalizedRequest)

  return response.data
}

export const backtestsApi = {
  getBacktestTemplates,
  runBacktest,
}
