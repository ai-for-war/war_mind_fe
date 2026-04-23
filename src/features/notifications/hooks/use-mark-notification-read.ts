import { useMutation, useQueryClient } from "@tanstack/react-query"

import { notificationsApi } from "@/features/notifications/api"
import {
  decrementUnreadCount,
  hasUnreadNotificationInList,
  markNotificationReadInList,
} from "@/features/notifications/notification-cache.utils"
import { notificationsQueryKeys } from "@/features/notifications/query-keys"
import type {
  MarkNotificationReadMutationInput,
  NotificationListResponse,
} from "@/features/notifications/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

export const useMarkNotificationRead = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ notificationId }: MarkNotificationReadMutationInput) =>
      notificationsApi.markNotificationAsRead(notificationId),
    mutationKey: notificationsQueryKeys.mutation("mark-read"),
    onSuccess: async (readState) => {
      const cachedLists = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationsQueryKeys.lists(activeOrganizationId),
      })
      const shouldDecrementUnreadCount = cachedLists.some(([, list]) =>
        hasUnreadNotificationInList(list, readState.id),
      )

      queryClient.setQueriesData<NotificationListResponse>(
        {
          queryKey: notificationsQueryKeys.lists(activeOrganizationId),
        },
        (currentList) =>
          currentList ? markNotificationReadInList(currentList, readState) : currentList,
      )

      if (shouldDecrementUnreadCount) {
        queryClient.setQueryData(
          notificationsQueryKeys.unreadCount(activeOrganizationId),
          decrementUnreadCount,
        )
      }
    },
  })
}
