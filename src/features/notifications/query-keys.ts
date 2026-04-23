import { normalizeNotificationListParams } from "@/features/notifications/types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const

export const notificationsQueryKeys = {
  all: NOTIFICATIONS_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [
      ...notificationsQueryKeys.all,
      "organization",
      getOrganizationQueryScope(organizationId),
    ] as const,
  unreadCount: (organizationId?: string | null) =>
    [...notificationsQueryKeys.scoped(organizationId), "unread-count"] as const,
  lists: (organizationId?: string | null) =>
    [...notificationsQueryKeys.scoped(organizationId), "list"] as const,
  list: (
    organizationId?: string | null,
    params?: { page?: number | null; pageSize?: number | null },
  ) => {
    const normalizedParams = normalizeNotificationListParams(params)

    return [
      ...notificationsQueryKeys.lists(organizationId),
      {
        page: normalizedParams.page,
        pageSize: normalizedParams.pageSize,
      },
    ] as const
  },
  mutations: () => [...notificationsQueryKeys.all, "mutation"] as const,
  mutation: (name: string) => [...notificationsQueryKeys.mutations(), name] as const,
}
