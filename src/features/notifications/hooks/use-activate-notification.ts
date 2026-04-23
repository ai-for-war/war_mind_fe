import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { resolveNotificationNavigationTarget } from "@/features/notifications/notification-routing.utils"
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-mark-notification-read"
import { getNotificationApiErrorMessage } from "@/features/notifications/notifications.utils"
import type { NotificationSummary } from "@/features/notifications/types"

export const useActivateNotification = () => {
  const navigate = useNavigate()
  const markNotificationReadMutation = useMarkNotificationRead()

  return useCallback(
    async (notification: NotificationSummary) => {
      try {
        const navigationTarget = resolveNotificationNavigationTarget(notification)

        await markNotificationReadMutation.mutateAsync({
          notificationId: notification.id,
        })

        if (navigationTarget.mode === "navigate") {
          navigate(navigationTarget.to)
        }

        return navigationTarget.mode
      } catch (error) {
        toast.error(getNotificationApiErrorMessage(error))
        return null
      }
    },
    [markNotificationReadMutation, navigate],
  )
}
