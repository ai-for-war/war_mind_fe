export const DEFAULT_NOTIFICATION_PAGE = 1
export const DEFAULT_NOTIFICATION_PAGE_SIZE = 20
export const MAX_NOTIFICATION_PAGE_SIZE = 100

export type NotificationMetadata = Record<string, unknown>

export type NotificationSummary = {
  id: string
  user_id: string
  organization_id: string
  type: string
  title: string
  body: string
  target_type: string
  target_id: string
  link: string | null
  actor_id: string | null
  metadata: NotificationMetadata | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export type NotificationUnreadCountResponse = {
  unread_count: number
}

export type NotificationListParams = {
  page?: number | null
  pageSize?: number | null
}

export type NotificationListResponse = {
  items: NotificationSummary[]
  total: number
  page: number
  page_size: number
}

export type NotificationMarkReadResponse = {
  id: string
  is_read: true
  read_at: string
}

export type NotificationMarkAllReadResponse = {
  updated_count: number
  marked_all_read: true
  read_at: string
}

export type NotificationCreatedSocketPayload = NotificationSummary

export type MarkNotificationReadMutationInput = {
  notificationId: string
}

export const normalizeNotificationId = (
  notificationId?: string | null,
): string | null => {
  const normalizedNotificationId = notificationId?.trim()

  return normalizedNotificationId && normalizedNotificationId.length > 0
    ? normalizedNotificationId
    : null
}

const normalizePositiveInteger = (
  value: number | null | undefined,
): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null
  }

  const normalizedValue = Math.floor(value)

  return normalizedValue >= 1 ? normalizedValue : null
}

export const normalizeNotificationListParams = (
  params?: NotificationListParams,
): Required<NotificationListParams> => {
  const normalizedPage =
    normalizePositiveInteger(params?.page) ?? DEFAULT_NOTIFICATION_PAGE
  const normalizedPageSize =
    normalizePositiveInteger(params?.pageSize) ?? DEFAULT_NOTIFICATION_PAGE_SIZE

  return {
    page: normalizedPage,
    pageSize: Math.min(normalizedPageSize, MAX_NOTIFICATION_PAGE_SIZE),
  }
}
