import { useMutation, useQueryClient } from "@tanstack/react-query"

import { skillPluginsApi } from "@/features/skill-plugins/api"
import { skillPluginQueryKeys } from "@/features/skill-plugins/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useDeleteSkillPlugin = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (skillId: string) => skillPluginsApi.deleteSkill(skillId),
    mutationKey: skillPluginQueryKeys.mutation("delete"),
    onSuccess: async (_, skillId) => {
      await queryClient.cancelQueries({
        queryKey: skillPluginQueryKeys.detail(activeOrganizationId, skillId),
      })

      queryClient.removeQueries({
        queryKey: skillPluginQueryKeys.detail(activeOrganizationId, skillId),
      })

      await queryClient.invalidateQueries({
        queryKey: skillPluginQueryKeys.lists(activeOrganizationId),
      })
    },
  })
}
