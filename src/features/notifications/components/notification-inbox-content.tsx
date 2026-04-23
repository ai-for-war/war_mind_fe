"use client"

import { Bell, CheckCheck, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationInboxItem } from "@/features/notifications/components/notification-inbox-item"
import { useActivateNotification } from "@/features/notifications/hooks/use-activate-notification"
import { useMarkAllNotificationsRead } from "@/features/notifications/hooks/use-mark-all-notifications-read"
import { useNotifications } from "@/features/notifications/hooks/use-notifications"
import { useNotificationUnreadCount } from "@/features/notifications/hooks/use-notification-unread-count"
import { getNotificationApiErrorMessage } from "@/features/notifications/notifications.utils"
import type { NotificationSummary } from "@/features/notifications/types"

type NotificationInboxContentProps = {
  isEnabled?: boolean
  onRequestClose?: () => void
}

const NotificationInboxSkeleton = () => (
  <div className="flex flex-col gap-3 px-1 py-1">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={`notification-skeleton-${index}`}
        className="flex flex-col gap-3 rounded-2xl border border-border/50 px-4 py-3"
      >
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
)

export const NotificationInboxContent = ({
  isEnabled = true,
  onRequestClose,
}: NotificationInboxContentProps) => {
  const activateNotification = useActivateNotification()
  const markAllNotificationsReadMutation = useMarkAllNotificationsRead()
  const notificationsQuery = useNotifications({ isEnabled })
  const unreadCountQuery = useNotificationUnreadCount({ isEnabled })
  const unreadCount =
    unreadCountQuery.unreadCount ??
    notificationsQuery.items.filter((notification) => !notification.is_read).length

  const handleNotificationSelect = async (notification: NotificationSummary) => {
    const activationMode = await activateNotification(notification)

    if (activationMode === "navigate") {
      onRequestClose?.()
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadMutation.mutateAsync()
    } catch (error) {
      toast.error(getNotificationApiErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3 px-1 pb-4">
        <div className="flex min-w-0 flex-col">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Notifications
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleMarkAllRead()}
          disabled={unreadCount < 1 || markAllNotificationsReadMutation.isPending}
        >
          <CheckCheck data-icon="inline-start" />
          Mark all
        </Button>
      </div>

      <Separator className="mb-3" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {notificationsQuery.isLoading ? <NotificationInboxSkeleton /> : null}

        {!notificationsQuery.isLoading && notificationsQuery.isError ? (
          <Empty className="min-h-[18rem] border-border/60 bg-background/30 px-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bell className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Unable to load notifications</EmptyTitle>
              <EmptyDescription>
                Retry the inbox request when the notification service is reachable again.
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" onClick={() => void notificationsQuery.refetch()}>
              <RefreshCw data-icon="inline-start" />
              Retry
            </Button>
          </Empty>
        ) : null}

        {!notificationsQuery.isLoading &&
        !notificationsQuery.isError &&
        notificationsQuery.items.length === 0 ? (
          <Empty className="min-h-[18rem] border-border/60 bg-background/30 px-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bell className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No notifications yet</EmptyTitle>
              <EmptyDescription>
                This inbox stays scoped to the active organization and updates when new
                internal events arrive.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {!notificationsQuery.isLoading &&
        !notificationsQuery.isError &&
        notificationsQuery.items.length > 0 ? (
          <ScrollArea className="min-h-0 flex-1 pr-1">
            <div className="flex min-w-0 flex-col">
              {notificationsQuery.items.map((notification, index) => (
                <div key={notification.id} className="flex min-w-0 flex-col">
                  <NotificationInboxItem
                    isBusy={markAllNotificationsReadMutation.isPending}
                    notification={notification}
                    onSelect={handleNotificationSelect}
                  />
                  {index < notificationsQuery.items.length - 1 ? (
                    <Separator className="my-1" />
                  ) : null}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : null}
      </div>
    </div>
  )
}
