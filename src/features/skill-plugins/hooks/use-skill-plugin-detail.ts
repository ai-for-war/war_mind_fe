import { useQuery } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"

export const useSkillPluginDetail = (skillId?: string) =>
  useQuery({
    enabled: Boolean(skillId?.trim()),
    queryFn: () => skillPluginsApi.getSkill(skillId as string),
    queryKey: skillPluginQueryKeys.detail(skillId),
  })
