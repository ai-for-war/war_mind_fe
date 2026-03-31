import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  mapSkillPluginUpdateRequest,
  skillPluginsApi,
} from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import type { UpdateSkillPluginMutationInput } from "@/features/skill-plugins/types"

export const useUpdateSkillPlugin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ currentValues, initialValues, skillId }: UpdateSkillPluginMutationInput) =>
      skillPluginsApi.updateSkill(
        skillId,
        mapSkillPluginUpdateRequest({
          currentValues,
          initialValues,
        }),
      ),
    mutationKey: skillPluginQueryKeys.mutation("update"),
    onSuccess: async (updatedSkill) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: skillPluginQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: skillPluginQueryKeys.detail(updatedSkill.skill_id),
        }),
      ])
    },
  })
}
