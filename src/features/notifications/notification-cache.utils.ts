import type {
  NotificationCreatedSocketPayload,
  NotificationListResponse,
  NotificationMarkReadResponse,
  NotificationSummary,
  NotificationUnreadCountResponse,
} from "@/features/notifications/types"

export const markNotificationReadInList = (
  list: NotificationListResponse,
  readState: NotificationMarkReadResponse,
): NotificationListResponse => {
  let didUpdateUnreadItem = false

  const items = list.items.map((item) => {
    if (item.id !== readState.id) {
      return item
    }

    if (!item.is_read) {
      didUpdateUnreadItem = true
    }

    return {
      ...item,
      is_read: true,
      read_at: readState.read_at,
    }
  })

  return {
    ...list,
    items,
    total: list.total,
    page: list.page,
    page_size: list.page_size,
    ...(didUpdateUnreadItem ? {} : {}),
  }
}

export const hasUnreadNotificationInList = (
  list: NotificationListResponse | undefined,
  notificationId: string,
): boolean =>
  list?.items.some((item) => item.id === notificationId && !item.is_read) ?? false

export const updateUnreadCount = (
  unreadCount: NotificationUnreadCountResponse | undefined,
  nextUnreadCount: number,
): NotificationUnreadCountResponse => ({
  unread_count: Math.max(0, nextUnreadCount),
})

export const hasNotificationInList = (
  list: NotificationListResponse | undefined,
  notificationId: string,
): boolean => list?.items.some((item) => item.id === notificationId) ?? false

export const decrementUnreadCount = (
  unreadCount: NotificationUnreadCountResponse | undefined,
): NotificationUnreadCountResponse =>
  updateUnreadCount(unreadCount, (unreadCount?.unread_count ?? 0) - 1)

export const incrementUnreadCount = (
  unreadCount: NotificationUnreadCountResponse | undefined,
): NotificationUnreadCountResponse =>
  updateUnreadCount(unreadCount, (unreadCount?.unread_count ?? 0) + 1)

export const markAllNotificationsReadInList = (
  list: NotificationListResponse,
  readAt: string,
): NotificationListResponse => ({
  ...list,
  items: list.items.map((item) => ({
    ...item,
    is_read: true,
    read_at: item.read_at ?? readAt,
  })),
})

export const prependNotificationToCachedList = (
  list: NotificationListResponse,
  notification: NotificationCreatedSocketPayload,
): NotificationListResponse => {
  const remainingItems = list.items.filter((item) => item.id !== notification.id)

  return {
    ...list,
    items: [notification, ...remainingItems].slice(0, list.page_size),
    total: list.total + (remainingItems.length === list.items.length ? 1 : 0),
  }
}

export const replaceNotificationInCachedList = (
  list: NotificationListResponse,
  notification: NotificationSummary,
): NotificationListResponse => ({
  ...list,
  items: list.items.map((item) => (item.id === notification.id ? notification : item)),
})
