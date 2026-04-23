import { Bell } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { NotificationInbox, useNotificationUnreadCount } from "@/features/notifications"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"
import { cn } from "@/lib/utils"

const formatUnreadCount = (unreadCount: number): string =>
  unreadCount > 99 ? "99+" : `${unreadCount}`

export const HeaderNotificationInbox = () => {
  const activeOrganizationId = useActiveOrganizationId()
  const [open, setOpen] = useState(false)
  const unreadCountQuery = useNotificationUnreadCount({
    isEnabled: activeOrganizationId != null,
  })

  return (
    <NotificationInbox open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        className={cn(
          "relative size-9 rounded-full border-border/60 bg-background/70 p-0 shadow-sm backdrop-blur-sm",
          "hover:bg-accent/60",
        )}
        disabled={activeOrganizationId == null}
        aria-label={
          unreadCountQuery.unreadCount > 0
            ? `${unreadCountQuery.unreadCount} unread notifications`
            : "Open notifications"
        }
      >
        {unreadCountQuery.isFetching ? (
          <Spinner  className="size-4" />
        ) : (
          <Bell data-icon="inline-start" />
        )}
        {unreadCountQuery.unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
            {formatUnreadCount(unreadCountQuery.unreadCount)}
          </span>
        ) : null}
      </Button>
    </NotificationInbox>
  )
}
