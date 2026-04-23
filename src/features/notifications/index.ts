export { notificationsApi } from "@/features/notifications/api"
export {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useNotificationUnreadCount,
} from "@/features/notifications/hooks"
export { notificationsQueryKeys } from "@/features/notifications/query-keys"
export {
  DEFAULT_NOTIFICATION_PAGE,
  DEFAULT_NOTIFICATION_PAGE_SIZE,
  MAX_NOTIFICATION_PAGE_SIZE,
  normalizeNotificationId,
  normalizeNotificationListParams,
} from "@/features/notifications/types"
export type {
  MarkNotificationReadMutationInput,
  NotificationCreatedSocketPayload,
  NotificationListParams,
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationMarkReadResponse,
  NotificationMetadata,
  NotificationSummary,
  NotificationUnreadCountResponse,
} from "@/features/notifications/types"
