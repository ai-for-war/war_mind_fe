import { apiClient } from "@/lib/api-client"

import type {
  NotificationListParams,
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationMarkReadResponse,
  NotificationSummary,
  NotificationUnreadCountResponse,
} from "@/features/notifications/types"
import {
  normalizeNotificationId,
  normalizeNotificationListParams,
} from "@/features/notifications/types"

const NOTIFICATIONS_ENDPOINT = "/notifications"

const getNotificationUnreadCount =
  async (): Promise<NotificationUnreadCountResponse> => {
    const response = await apiClient.get<NotificationUnreadCountResponse>(
      `${NOTIFICATIONS_ENDPOINT}/unread-count`,
    )

    return response.data
  }

const listNotifications = async (
  params?: NotificationListParams,
): Promise<NotificationListResponse> => {
  const normalizedParams = normalizeNotificationListParams(params)
  const response = await apiClient.get<NotificationListResponse>(
    NOTIFICATIONS_ENDPOINT,
    {
      params: {
        page: normalizedParams.page,
        page_size: normalizedParams.pageSize,
      },
    },
  )

  return response.data
}

const markNotificationAsRead = async (
  notificationId: string,
): Promise<NotificationMarkReadResponse> => {
  const normalizedNotificationId = normalizeNotificationId(notificationId)

  if (!normalizedNotificationId) {
    throw new Error("Notification read requires a non-empty notification id")
  }

  const response = await apiClient.post<NotificationMarkReadResponse>(
    `${NOTIFICATIONS_ENDPOINT}/${normalizedNotificationId}/read`,
  )

  return response.data
}

const markAllNotificationsAsRead =
  async (): Promise<NotificationMarkAllReadResponse> => {
    const response = await apiClient.post<NotificationMarkAllReadResponse>(
      `${NOTIFICATIONS_ENDPOINT}/read-all`,
    )

    return response.data
  }

const prependNotificationToList = (
  notification: NotificationSummary,
  list: NotificationListResponse,
): NotificationListResponse => {
  const deduplicatedItems = list.items.filter((item) => item.id !== notification.id)

  return {
    ...list,
    items: [notification, ...deduplicatedItems].slice(0, list.page_size),
    total: list.total + (deduplicatedItems.length === list.items.length ? 1 : 0),
  }
}

export const notificationsApi = {
  getNotificationUnreadCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  prependNotificationToList,
}
