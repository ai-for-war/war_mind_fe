import { useMutation, useQueryClient } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useEnableSkillPlugin = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (skillId: string) => skillPluginsApi.enableSkill(skillId),
    mutationKey: skillPluginQueryKeys.mutation("enable"),
    onSuccess: async ({ skill_id: skillId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: skillPluginQueryKeys.lists(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: skillPluginQueryKeys.detail(activeOrganizationId, skillId),
        }),
      ])
    },
  })
}
