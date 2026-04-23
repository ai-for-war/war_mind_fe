import { useQuery } from "@tanstack/react-query"

import { notificationsApi } from "@/features/notifications/api"
import { notificationsQueryKeys } from "@/features/notifications/query-keys"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseNotificationUnreadCountOptions = {
  isEnabled?: boolean
}

export const useNotificationUnreadCount = ({
  isEnabled = true,
}: UseNotificationUnreadCountOptions = {}) => {
  const activeOrganizationId = useActiveOrganizationId()

  const query = useQuery({
    queryFn: () => notificationsApi.getNotificationUnreadCount(),
    queryKey: notificationsQueryKeys.unreadCount(activeOrganizationId),
    enabled: isEnabled,
  })

  return {
    ...query,
    unreadCount: query.data?.unread_count ?? 0,
  }
}
