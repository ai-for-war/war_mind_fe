import { useMutation, useQueryClient } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import type { CreateSkillPluginRequest } from "@/features/skill-plugins/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useCreateSkillPlugin = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSkillPluginRequest) =>
      skillPluginsApi.createSkill(payload),
    mutationKey: skillPluginQueryKeys.mutation("create"),
    onSuccess: async (createdSkill) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: skillPluginQueryKeys.lists(activeOrganizationId),
        }),
        queryClient.invalidateQueries({
          queryKey: skillPluginQueryKeys.detail(
            activeOrganizationId,
            createdSkill.skill_id,
          ),
        }),
      ])
    },
  })
}
