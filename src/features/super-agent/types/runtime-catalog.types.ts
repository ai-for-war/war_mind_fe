export type LeadAgentReasoningOption = string

export interface LeadAgentRuntimeCatalogModelEntry {
  model: string
  reasoning_options: LeadAgentReasoningOption[]
  default_reasoning: LeadAgentReasoningOption | null
  is_default: boolean
}

export interface LeadAgentRuntimeCatalogProviderEntry {
  provider: string
  display_name: string
  is_default: boolean
  models: LeadAgentRuntimeCatalogModelEntry[]
}

export interface LeadAgentRuntimeCatalogResponse {
  default_provider: string
  default_model: string
  default_reasoning: LeadAgentReasoningOption | null
  providers: LeadAgentRuntimeCatalogProviderEntry[]
}

export interface SuperAgentRuntimeSelection {
  provider: string
  model: string
  reasoning: LeadAgentReasoningOption | null
}

export interface SuperAgentRuntimeSnapshotPayload {
  provider: string
  model: string
  reasoning?: LeadAgentReasoningOption
}

export interface NormalizeSuperAgentRuntimeSelectionResult {
  provider: LeadAgentRuntimeCatalogProviderEntry
  model: LeadAgentRuntimeCatalogModelEntry
  runtime: SuperAgentRuntimeSnapshotPayload
}
