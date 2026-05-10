import type {
  NormalizeStockAgentRuntimeSelectionResult,
  StockAgentRuntimeCatalogModelEntry,
  StockAgentRuntimeCatalogProviderEntry,
  StockAgentRuntimeCatalogResponse,
  StockAgentRuntimeSelection,
} from "@/features/stock-agent/types/runtime-catalog.types"

const hasReasoningOptions = (model: StockAgentRuntimeCatalogModelEntry): boolean =>
  model.reasoning_options.length > 0

export const getStockAgentRuntimeCatalogDefaultSelection = (
  catalog: StockAgentRuntimeCatalogResponse,
): StockAgentRuntimeSelection | null => {
  const provider =
    catalog.providers.find((entry) => entry.provider === catalog.default_provider) ??
    catalog.providers.find((entry) => entry.is_default) ??
    catalog.providers[0]

  if (!provider) {
    return null
  }

  const model =
    provider.models.find((entry) => entry.model === catalog.default_model) ??
    provider.models.find((entry) => entry.is_default) ??
    provider.models[0]

  if (!model) {
    return null
  }

  const reasoning = hasReasoningOptions(model)
    ? model.reasoning_options.find((option) => option === catalog.default_reasoning) ??
      model.reasoning_options.find((option) => option === model.default_reasoning) ??
      model.reasoning_options[0] ??
      null
    : null

  return {
    model: model.model,
    provider: provider.provider,
    reasoning,
  }
}

export const findStockAgentRuntimeCatalogProvider = (
  catalog: StockAgentRuntimeCatalogResponse,
  providerId: string,
): StockAgentRuntimeCatalogProviderEntry | null =>
  catalog.providers.find((provider) => provider.provider === providerId) ?? null

export const findStockAgentRuntimeCatalogModel = (
  provider: StockAgentRuntimeCatalogProviderEntry,
  modelId: string,
): StockAgentRuntimeCatalogModelEntry | null =>
  provider.models.find((model) => model.model === modelId) ?? null

export const normalizeStockAgentRuntimeSelection = (
  catalog: StockAgentRuntimeCatalogResponse,
  selection: StockAgentRuntimeSelection | null | undefined,
): NormalizeStockAgentRuntimeSelectionResult | null => {
  if (!selection) {
    return null
  }

  const provider = findStockAgentRuntimeCatalogProvider(catalog, selection.provider)
  if (!provider) {
    return null
  }

  const model = findStockAgentRuntimeCatalogModel(provider, selection.model)
  if (!model) {
    return null
  }

  if (!hasReasoningOptions(model)) {
    return {
      model,
      provider,
      runtime: {
        model: model.model,
        provider: provider.provider,
      },
    }
  }

  const reasoning = selection.reasoning?.trim()
  if (!reasoning || !model.reasoning_options.includes(reasoning)) {
    return null
  }

  return {
    model,
    provider,
    runtime: {
      model: model.model,
      provider: provider.provider,
      reasoning,
    },
  }
}

const areSelectionsEqual = (
  left: StockAgentRuntimeSelection | null,
  right: StockAgentRuntimeSelection | null,
): boolean =>
  left?.provider === right?.provider &&
  left?.model === right?.model &&
  left?.reasoning === right?.reasoning

export interface ResolveStockAgentRuntimeSelectionResult {
  nextSelection: StockAgentRuntimeSelection | null
  normalized: NormalizeStockAgentRuntimeSelectionResult | null
  changed: boolean
}

export const resolveStockAgentRuntimeSelection = (
  catalog: StockAgentRuntimeCatalogResponse,
  selection: StockAgentRuntimeSelection | null | undefined,
): ResolveStockAgentRuntimeSelectionResult => {
  const normalized = normalizeStockAgentRuntimeSelection(catalog, selection)

  if (normalized && selection) {
    return {
      changed: false,
      nextSelection: {
        model: normalized.runtime.model,
        provider: normalized.runtime.provider,
        reasoning: normalized.runtime.reasoning ?? null,
      },
      normalized,
    }
  }

  const fallbackSelection = getStockAgentRuntimeCatalogDefaultSelection(catalog)

  return {
    changed: !areSelectionsEqual(selection ?? null, fallbackSelection),
    nextSelection: fallbackSelection,
    normalized: fallbackSelection
      ? normalizeStockAgentRuntimeSelection(catalog, fallbackSelection)
      : null,
  }
}
