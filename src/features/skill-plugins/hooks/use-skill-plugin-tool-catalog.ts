import { useQuery } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useSkillPluginToolCatalog = () => {
  const activeOrganizationId = useActiveOrganizationId()

  return useQuery({
    queryFn: skillPluginsApi.getToolCatalog,
    queryKey: skillPluginQueryKeys.toolCatalog(activeOrganizationId),
  })
}
