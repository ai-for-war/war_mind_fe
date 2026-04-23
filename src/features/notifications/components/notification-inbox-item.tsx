import { Circle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { resolveNotificationNavigationTarget } from "@/features/notifications/notification-routing.utils"
import { cn } from "@/lib/utils"
import {
  formatNotificationRelativeTime,
  getNotificationDestinationLabel,
  getNotificationReportStatus,
  getNotificationSymbol,
} from "@/features/notifications/notifications.utils"
import type { NotificationSummary } from "@/features/notifications/types"

type NotificationInboxItemProps = {
  isBusy?: boolean
  notification: NotificationSummary
  onSelect: (notification: NotificationSummary) => void
}

export const NotificationInboxItem = ({
  isBusy = false,
  notification,
  onSelect,
}: NotificationInboxItemProps) => {
  const symbol = getNotificationSymbol(notification)
  const reportStatus = getNotificationReportStatus(notification)
  const hasNavigationTarget =
    resolveNotificationNavigationTarget(notification).mode === "navigate"

  return (
    <button
      type="button"
      onClick={() => void onSelect(notification)}
      disabled={isBusy}
      className={cn(
        "group flex w-full min-w-0 flex-col gap-3 rounded-2xl px-4 py-3 text-left transition-colors",
        "hover:bg-accent/55 focus-visible:bg-accent/55 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        !notification.is_read && "bg-accent/20",
      )}
      aria-label={`${notification.title}. ${getNotificationDestinationLabel(notification, hasNavigationTarget)}`}
      aria-label={notification.title}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {!notification.is_read ? (
            <Circle className="size-2.5 fill-current text-primary" />
          ) : null}
          <p
            className={cn(
              "min-w-0 truncate text-sm font-medium tracking-tight text-foreground",
              !notification.is_read && "text-foreground",
            )}
          >
            {notification.title}
          </p>
        </div>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {formatNotificationRelativeTime(notification.created_at)}
        </span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {notification.body}
      </p>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {symbol ? <Badge variant="outline">{symbol}</Badge> : null}
        {reportStatus ? <Badge variant="secondary">{reportStatus}</Badge> : null}
        {!hasNavigationTarget ? (
          <Badge variant="ghost">No destination</Badge>
        ) : null}
      </div>

    </button>
  )
}
