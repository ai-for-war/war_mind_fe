import { useMutation, useQueryClient } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"

export const useDisableSkillPlugin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (skillId: string) => skillPluginsApi.disableSkill(skillId),
    mutationKey: skillPluginQueryKeys.mutation("disable"),
    onSuccess: async ({ skill_id: skillId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: skillPluginQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: skillPluginQueryKeys.detail(skillId),
        }),
      ])
    },
  })
}
