import { useQuery } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import type { SkillPluginListParams } from "@/features/skill-plugins/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useSkillPluginList = (params?: SkillPluginListParams) => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    queryFn: () => skillPluginsApi.listSkills(params),
    queryKey: skillPluginQueryKeys.list(activeOrganizationId, params),
  })
}
