import { useMutation, useQueryClient } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"

export const useDeleteSkillPlugin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (skillId: string) => skillPluginsApi.deleteSkill(skillId),
    mutationKey: skillPluginQueryKeys.mutation("delete"),
    onSuccess: async (_, skillId) => {
      await queryClient.cancelQueries({
        queryKey: skillPluginQueryKeys.detail(skillId),
      })

      queryClient.removeQueries({
        queryKey: skillPluginQueryKeys.detail(skillId),
      })

      await queryClient.invalidateQueries({
        queryKey: skillPluginQueryKeys.lists(),
      })
    },
  })
}
