import type { StockResearchRuntimeConfigResponse } from "@/features/stock-research/types"

const normalizeStockResearchRuntimeText = (value: string | null | undefined) => {
  const normalizedValue = value?.trim()

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null
}

export const getStockResearchRuntimeParts = (
  runtimeConfig: StockResearchRuntimeConfigResponse | null | undefined,
): string[] => {
  if (!runtimeConfig) {
    return []
  }

  return [
    normalizeStockResearchRuntimeText(runtimeConfig.provider),
    normalizeStockResearchRuntimeText(runtimeConfig.model),
    normalizeStockResearchRuntimeText(runtimeConfig.reasoning),
  ].filter((part): part is string => part != null)
}

export const formatStockResearchRuntimeSummary = (
  runtimeConfig: StockResearchRuntimeConfigResponse | null | undefined,
) => {
  const parts = getStockResearchRuntimeParts(runtimeConfig)

  return parts.length > 0 ? parts.join(" / ") : "Legacy runtime"
}

export const formatStockResearchRuntimeChipLabel = (
  runtimeConfig: StockResearchRuntimeConfigResponse | null | undefined,
) => {
  const parts = getStockResearchRuntimeParts(runtimeConfig)

  return parts.length > 0 ? parts.join(" / ") : "Legacy runtime"
}
