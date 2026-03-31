import type { SkillPluginListParams } from "@/features/skill-plugins/types"

const DEFAULT_SKILL_PLUGINS_SKIP = 0
const DEFAULT_SKILL_PLUGINS_LIMIT = 8

export const skillPluginQueryKeys = {
  all: ["skill-plugins"] as const,
  lists: () => [...skillPluginQueryKeys.all, "list"] as const,
  list: (params?: SkillPluginListParams) =>
    [
      ...skillPluginQueryKeys.lists(),
      params?.skip ?? DEFAULT_SKILL_PLUGINS_SKIP,
      params?.limit ?? DEFAULT_SKILL_PLUGINS_LIMIT,
    ] as const,
  details: () => [...skillPluginQueryKeys.all, "detail"] as const,
  detail: (skillId?: string) => [...skillPluginQueryKeys.details(), skillId] as const,
  toolCatalog: () => [...skillPluginQueryKeys.all, "tool-catalog"] as const,
  mutations: () => [...skillPluginQueryKeys.all, "mutation"] as const,
  mutation: (name: string) => [...skillPluginQueryKeys.mutations(), name] as const,
}
