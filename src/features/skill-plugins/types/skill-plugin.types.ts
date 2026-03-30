export type SkillPluginStatusFilter = "all" | "enabled" | "disabled"

export type SkillPluginDialogType =
  | "create"
  | "detail"
  | "edit"
  | "delete"

export interface SkillPluginSummary {
  skill_id: string
  name: string
  description: string
  activation_prompt: string
  allowed_tool_names: string[]
  version: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

export type SkillPluginDetail = SkillPluginSummary

export interface SkillPluginToolCatalogItem {
  tool_name: string
  display_name: string
  description: string
  category: string
}

export interface SkillPluginListFilters {
  searchText: string
  status: SkillPluginStatusFilter
}

export interface SkillPluginFormValues {
  name: string
  description: string
  activation_prompt: string
  allowed_tool_names: string[]
}

export type CreateSkillPluginFormValues = SkillPluginFormValues

export interface EditSkillPluginFormValues extends SkillPluginFormValues {
  skill_id: string
}

export interface SkillPluginListResponse {
  items: SkillPluginSummary[]
  total: number
  skip: number
  limit: number
}

export interface SkillPluginToolCatalogResponse {
  items: SkillPluginToolCatalogItem[]
}

export interface SkillPluginEnablementResponse {
  skill_id: string
  is_enabled: boolean
}
