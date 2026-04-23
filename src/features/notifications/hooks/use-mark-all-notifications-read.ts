import { useMutation, useQueryClient } from "@tanstack/react-query"

import { notificationsApi } from "@/features/notifications/api"
import { markAllNotificationsReadInList } from "@/features/notifications/notification-cache.utils"
import { notificationsQueryKeys } from "@/features/notifications/query-keys"
import type { NotificationListResponse } from "@/features/notifications/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useMarkAllNotificationsRead = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllNotificationsAsRead(),
    mutationKey: notificationsQueryKeys.mutation("mark-all-read"),
    onSuccess: async (readState) => {
      queryClient.setQueryData(
        notificationsQueryKeys.unreadCount(activeOrganizationId),
        () => ({
          unread_count: 0,
        }),
      )

      queryClient.setQueriesData<NotificationListResponse>(
        {
          queryKey: notificationsQueryKeys.lists(activeOrganizationId),
        },
        (currentList) =>
          currentList
            ? markAllNotificationsReadInList(currentList, readState.read_at)
            : currentList,
      )
    },
  })
}
