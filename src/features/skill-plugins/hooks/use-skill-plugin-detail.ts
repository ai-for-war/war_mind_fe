import { useQuery } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useSkillPluginDetail = (skillId?: string) => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    enabled: Boolean(skillId?.trim()),
    queryFn: () => skillPluginsApi.getSkill(skillId as string),
    queryKey: skillPluginQueryKeys.detail(activeOrganizationId, skillId),
  })
}
