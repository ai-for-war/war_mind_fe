import { useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { resolveNotificationNavigationTarget } from "@/features/notifications/notification-routing.utils"
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-mark-notification-read"
import type { NotificationSummary } from "@/features/notifications/types"

export const useActivateNotification = () => {
  const navigate = useNavigate()
  const markNotificationReadMutation = useMarkNotificationRead()

  return useCallback(
    async (notification: NotificationSummary) => {
      const navigationTarget = resolveNotificationNavigationTarget(notification)

      await markNotificationReadMutation.mutateAsync({
        notificationId: notification.id,
      })

      if (navigationTarget.mode === "navigate") {
        navigate(navigationTarget.to)
      }
    },
    [markNotificationReadMutation, navigate],
  )
}
