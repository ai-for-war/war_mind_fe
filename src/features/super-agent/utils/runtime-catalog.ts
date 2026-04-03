import type {
  LeadAgentRuntimeCatalogModelEntry,
  LeadAgentRuntimeCatalogProviderEntry,
  LeadAgentRuntimeCatalogResponse,
  NormalizeSuperAgentRuntimeSelectionResult,
  SuperAgentRuntimeSelection,
} from "@/features/super-agent/types/runtime-catalog.types"

const hasReasoningOptions = (model: LeadAgentRuntimeCatalogModelEntry): boolean =>
  model.reasoning_options.length > 0

export const getLeadAgentRuntimeCatalogDefaultSelection = (
  catalog: LeadAgentRuntimeCatalogResponse,
): SuperAgentRuntimeSelection | null => {
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

export const findLeadAgentRuntimeCatalogProvider = (
  catalog: LeadAgentRuntimeCatalogResponse,
  providerId: string,
): LeadAgentRuntimeCatalogProviderEntry | null =>
  catalog.providers.find((provider) => provider.provider === providerId) ?? null

export const findLeadAgentRuntimeCatalogModel = (
  provider: LeadAgentRuntimeCatalogProviderEntry,
  modelId: string,
): LeadAgentRuntimeCatalogModelEntry | null =>
  provider.models.find((model) => model.model === modelId) ?? null

export const normalizeSuperAgentRuntimeSelection = (
  catalog: LeadAgentRuntimeCatalogResponse,
  selection: SuperAgentRuntimeSelection | null | undefined,
): NormalizeSuperAgentRuntimeSelectionResult | null => {
  if (!selection) {
    return null
  }

  const provider = findLeadAgentRuntimeCatalogProvider(catalog, selection.provider)
  if (!provider) {
    return null
  }

  const model = findLeadAgentRuntimeCatalogModel(provider, selection.model)
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
