import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  hasNotificationInList,
  incrementUnreadCount,
  prependNotificationToCachedList,
} from "@/features/notifications/notification-cache.utils"
import { resolveNotificationNavigationTarget } from "@/features/notifications/notification-routing.utils"
import { useActivateNotification } from "@/features/notifications/hooks/use-activate-notification"
import { notificationsQueryKeys } from "@/features/notifications/query-keys"
import { useSocketSubscription, useSocketTransportStore } from "@/features/socket"
import type {
  NotificationCreatedSocketPayload,
  NotificationListResponse,
} from "@/features/notifications/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

const getToastActionLabel = (hasNavigationTarget: boolean): string =>
  hasNavigationTarget ? "Open" : "Mark read"

export const useNotificationCreatedSubscription = (): void => {
  const activeOrganizationId = useActiveOrganizationId()
  const activateNotification = useActivateNotification()
  const queryClient = useQueryClient()
  const status = useSocketTransportStore((state) => state.status)
  const lastConnectedAt = useSocketTransportStore((state) => state.lastConnectedAt)
  const lastHandledConnectedAtRef = useRef<number | null>(null)

  useSocketSubscription<NotificationCreatedSocketPayload>(
    "notification:created",
    (notification) => {
      const cachedLists = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationsQueryKeys.lists(activeOrganizationId),
      })
      const hasCachedNotification = cachedLists.some(([, list]) =>
        hasNotificationInList(list, notification.id),
      )

      queryClient.setQueriesData<NotificationListResponse>(
        {
          queryKey: notificationsQueryKeys.lists(activeOrganizationId),
        },
        (currentList) =>
          currentList
            ? prependNotificationToCachedList(currentList, notification)
            : currentList,
      )

      if (!hasCachedNotification) {
        queryClient.setQueryData(
          notificationsQueryKeys.unreadCount(activeOrganizationId),
          incrementUnreadCount,
        )
      }

      const navigationTarget = resolveNotificationNavigationTarget(notification)

      toast(notification.title, {
        description: notification.body,
        action: {
          label: getToastActionLabel(navigationTarget.mode === "navigate"),
          onClick: () => {
            void activateNotification(notification)
          },
        },
      })
    },
    { organizationScoped: true },
  )

  useEffect(() => {
    if (status !== "connected" || !lastConnectedAt) {
      return
    }

    if (lastHandledConnectedAtRef.current === lastConnectedAt) {
      return
    }

    lastHandledConnectedAtRef.current = lastConnectedAt

    void Promise.all([
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.unreadCount(activeOrganizationId),
      }),
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.lists(activeOrganizationId),
      }),
    ])
  }, [activeOrganizationId, lastConnectedAt, queryClient, status])
}
