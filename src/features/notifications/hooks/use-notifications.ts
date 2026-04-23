import { useQuery } from "@tanstack/react-query"

import { notificationsApi } from "@/features/notifications/api"
import { notificationsQueryKeys } from "@/features/notifications/query-keys"
import { normalizeNotificationListParams } from "@/features/notifications/types"
import type { NotificationListParams } from "@/features/notifications/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseNotificationsOptions = NotificationListParams & {
  isEnabled?: boolean
}

export const useNotifications = ({
  isEnabled = true,
  page,
  pageSize,
}: UseNotificationsOptions = {}) => {
  const activeOrganizationId = useActiveOrganizationId()
  const normalizedParams = normalizeNotificationListParams({ page, pageSize })

  const query = useQuery({
    queryFn: () => notificationsApi.listNotifications(normalizedParams),
    queryKey: notificationsQueryKeys.list(activeOrganizationId, normalizedParams),
    enabled: isEnabled,
  })

  return {
    ...query,
    items: query.data?.items ?? [],
    page: query.data?.page ?? normalizedParams.page,
    pageSize: query.data?.page_size ?? normalizedParams.pageSize,
    total: query.data?.total ?? 0,
  }
}
