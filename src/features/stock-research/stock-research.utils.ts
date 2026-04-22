import { isAxiosError } from "axios"

import type {
  StockResearchCatalogModelResponse,
  StockResearchCatalogProviderResponse,
  StockResearchCatalogResponse,
  StockResearchRuntimeConfig,
} from "@/features/stock-research/types"
import type { ApiErrorResponse } from "@/types/api"

const DEFAULT_STOCK_RESEARCH_ERROR_MESSAGE =
  "Something went wrong while processing the stock research request."

export type StockResearchRuntimeSelection = {
  model: string | null
  provider: string | null
  reasoning: string | null
}

export const getStockResearchApiErrorMessage = (
  error: unknown,
  fallback = DEFAULT_STOCK_RESEARCH_ERROR_MESSAGE,
) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ")
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export const getStockResearchProviderById = (
  catalog: StockResearchCatalogResponse | undefined,
  providerValue?: string | null,
): StockResearchCatalogProviderResponse | null => {
  if (!catalog || !providerValue) {
    return null
  }

  return catalog.providers.find((provider) => provider.provider === providerValue) ?? null
}

export const getStockResearchDefaultProvider = (
  catalog: StockResearchCatalogResponse | undefined,
): StockResearchCatalogProviderResponse | null => {
  if (!catalog || catalog.providers.length === 0) {
    return null
  }

  return (
    catalog.providers.find((provider) => provider.provider === catalog.default_provider) ??
    catalog.providers.find((provider) => provider.is_default) ??
    catalog.providers[0] ??
    null
  )
}

export const getStockResearchDefaultAvailableProvider = (
  catalog: StockResearchCatalogResponse | undefined,
): StockResearchCatalogProviderResponse | null => {
  if (!catalog || catalog.providers.length === 0) {
    return null
  }

  const defaultProvider = getStockResearchDefaultProvider(catalog)

  if (defaultProvider && defaultProvider.models.length > 0) {
    return defaultProvider
  }

  return catalog.providers.find((provider) => provider.models.length > 0) ?? defaultProvider
}

export const getStockResearchModelById = (
  provider: StockResearchCatalogProviderResponse | null | undefined,
  modelValue?: string | null,
): StockResearchCatalogModelResponse | null => {
  if (!provider || !modelValue) {
    return null
  }

  return provider.models.find((model) => model.model === modelValue) ?? null
}

export const getStockResearchDefaultModel = (
  provider: StockResearchCatalogProviderResponse | null | undefined,
  preferredModel?: string | null,
): StockResearchCatalogModelResponse | null => {
  if (!provider || provider.models.length === 0) {
    return null
  }

  return (
    provider.models.find((model) => model.model === preferredModel) ??
    provider.models.find((model) => model.is_default) ??
    provider.models[0] ??
    null
  )
}

export const getStockResearchDefaultReasoning = ({
  catalog,
  model,
  provider,
}: {
  catalog: StockResearchCatalogResponse | undefined
  model: StockResearchCatalogModelResponse | null | undefined
  provider: StockResearchCatalogProviderResponse | null | undefined
}) => {
  if (!model) {
    return null
  }

  if (
    catalog &&
    provider?.provider === catalog.default_provider &&
    model.model === catalog.default_model
  ) {
    return catalog.default_reasoning
  }

  return model.default_reasoning
}

export const getStockResearchDefaultRuntimeSelection = (
  catalog: StockResearchCatalogResponse | undefined,
): StockResearchRuntimeSelection => {
  const provider = getStockResearchDefaultAvailableProvider(catalog)
  const model = getStockResearchDefaultModel(provider, catalog?.default_model)

  return {
    provider: provider?.provider ?? null,
    model: model?.model ?? null,
    reasoning: getStockResearchDefaultReasoning({
      catalog,
      model,
      provider,
    }),
  }
}

export const buildStockResearchRuntimeOverride = ({
  catalog,
  selection,
}: {
  catalog: StockResearchCatalogResponse | undefined
  selection: StockResearchRuntimeSelection
}): StockResearchRuntimeConfig | null => {
  if (!catalog || !selection.provider || !selection.model) {
    return null
  }

  const defaultSelection = getStockResearchDefaultRuntimeSelection(catalog)

  if (
    selection.provider === defaultSelection.provider &&
    selection.model === defaultSelection.model &&
    selection.reasoning === defaultSelection.reasoning
  ) {
    return null
  }

  return {
    provider: selection.provider,
    model: selection.model,
    reasoning: selection.reasoning,
  }
}
