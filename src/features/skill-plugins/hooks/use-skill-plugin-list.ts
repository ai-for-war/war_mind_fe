import { useQuery } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import type { SkillPluginListParams } from "@/features/skill-plugins/types"

export const useSkillPluginList = (params?: SkillPluginListParams) =>
  useQuery({
    queryFn: () => skillPluginsApi.listSkills(params),
    queryKey: skillPluginQueryKeys.list(params),
  })
