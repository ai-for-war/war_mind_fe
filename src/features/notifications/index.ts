export { notificationsApi } from "@/features/notifications/api"
export { getNotificationApiErrorMessage } from "@/features/notifications/notifications.utils"
export {
  resolveNotificationNavigationTarget,
  type NotificationNavigationTarget,
} from "@/features/notifications/notification-routing.utils"
export {
  NotificationInbox,
  NotificationInboxContent,
  NotificationInboxItem,
} from "@/features/notifications/components"
export {
  useActivateNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationCreatedSubscription,
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
