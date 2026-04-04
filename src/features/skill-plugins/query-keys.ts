import type { SkillPluginListParams } from "@/features/skill-plugins/types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const DEFAULT_SKILL_PLUGINS_SKIP = 0
const DEFAULT_SKILL_PLUGINS_LIMIT = 8

export const skillPluginQueryKeys = {
  all: ["skill-plugins"] as const,
  scoped: (organizationId?: string | null) =>
    [...skillPluginQueryKeys.all, "organization", getOrganizationQueryScope(organizationId)] as const,
  lists: (organizationId?: string | null) =>
    [...skillPluginQueryKeys.scoped(organizationId), "list"] as const,
  list: (organizationId?: string | null, params?: SkillPluginListParams) =>
    [
      ...skillPluginQueryKeys.lists(organizationId),
      params?.search?.trim() ?? "",
      params?.filter ?? "all",
      params?.skip ?? DEFAULT_SKILL_PLUGINS_SKIP,
      params?.limit ?? DEFAULT_SKILL_PLUGINS_LIMIT,
    ] as const,
  details: (organizationId?: string | null) =>
    [...skillPluginQueryKeys.scoped(organizationId), "detail"] as const,
  detail: (organizationId?: string | null, skillId?: string) =>
    [...skillPluginQueryKeys.details(organizationId), skillId] as const,
  toolCatalog: (organizationId?: string | null) =>
    [...skillPluginQueryKeys.scoped(organizationId), "tool-catalog"] as const,
  mutations: () => [...skillPluginQueryKeys.all, "mutation"] as const,
  mutation: (name: string) => [...skillPluginQueryKeys.mutations(), name] as const,
}
