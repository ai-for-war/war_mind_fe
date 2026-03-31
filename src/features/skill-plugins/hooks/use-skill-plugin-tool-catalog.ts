import { useQuery } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"

export const useSkillPluginToolCatalog = () =>
  useQuery({
    queryFn: skillPluginsApi.getToolCatalog,
    queryKey: skillPluginQueryKeys.toolCatalog(),
  })
