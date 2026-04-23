import type { To } from "react-router-dom"

import type { NotificationSummary } from "@/features/notifications/types"

export type NotificationNavigationTarget =
  | {
      mode: "navigate"
      to: To
    }
  | {
      mode: "none"
    }

const resolveNotificationTargetTypeRoute = (
  notification: NotificationSummary,
): To | null => {
  switch (notification.target_type) {
    case "stock_research_report":
      return {
        pathname: "/stocks/research",
        search: `?reportId=${encodeURIComponent(notification.target_id)}`,
      }
    default:
      return null
  }
}

export const resolveNotificationNavigationTarget = (
  notification: NotificationSummary,
): NotificationNavigationTarget => {
  const targetRoute = resolveNotificationTargetTypeRoute(notification)

  if (targetRoute) {
    return {
      mode: "navigate",
      to: targetRoute,
    }
  }

  if (notification.link) {
    return {
      mode: "navigate",
      to: notification.link,
    }
  }

  return {
    mode: "none",
  }
}
