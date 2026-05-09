export type StockAgentReasoningOption = string

export interface StockAgentRuntimeCatalogModelEntry {
  model: string
  reasoning_options: StockAgentReasoningOption[]
  default_reasoning: StockAgentReasoningOption | null
  is_default: boolean
}

export interface StockAgentRuntimeCatalogProviderEntry {
  provider: string
  display_name: string
  is_default: boolean
  models: StockAgentRuntimeCatalogModelEntry[]
}

export interface StockAgentRuntimeCatalogResponse {
  default_provider: string
  default_model: string
  default_reasoning: StockAgentReasoningOption | null
  providers: StockAgentRuntimeCatalogProviderEntry[]
}

export interface StockAgentRuntimeSelection {
  provider: string
  model: string
  reasoning: StockAgentReasoningOption | null
}

export interface StockAgentRuntimeSnapshotPayload {
  provider: string
  model: string
  reasoning?: StockAgentReasoningOption
}

export interface NormalizeStockAgentRuntimeSelectionResult {
  provider: StockAgentRuntimeCatalogProviderEntry
  model: StockAgentRuntimeCatalogModelEntry
  runtime: StockAgentRuntimeSnapshotPayload
}
