import { useMutation, useQueryClient } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import type { CreateSkillPluginRequest } from "@/features/skill-plugins/types"

export const useCreateSkillPlugin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSkillPluginRequest) =>
      skillPluginsApi.createSkill(payload),
    mutationKey: skillPluginQueryKeys.mutation("create"),
    onSuccess: async (createdSkill) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: skillPluginQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: skillPluginQueryKeys.detail(createdSkill.skill_id),
        }),
      ])
    },
  })
}
