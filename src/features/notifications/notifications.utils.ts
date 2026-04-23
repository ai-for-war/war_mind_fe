import { formatDistanceToNowStrict, isValid, parseISO } from "date-fns"
import { isAxiosError } from "axios"

import type { NotificationMetadata, NotificationSummary } from "@/features/notifications/types"
import type { ApiErrorResponse } from "@/types/api"

const DEFAULT_NOTIFICATION_ERROR_MESSAGE =
  "Something went wrong while processing the notification request."

const readNotificationMetadataString = (
  metadata: NotificationMetadata | null,
  key: string,
): string | null => {
  if (!metadata) {
    return null
  }

  const value = metadata[key]

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

export const getNotificationApiErrorMessage = (
  error: unknown,
  fallback = DEFAULT_NOTIFICATION_ERROR_MESSAGE,
) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ")
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export const getNotificationSymbol = (
  notification: NotificationSummary,
): string | null => readNotificationMetadataString(notification.metadata, "symbol")

export const getNotificationReportStatus = (
  notification: NotificationSummary,
): string | null => readNotificationMetadataString(notification.metadata, "report_status")

export const formatNotificationRelativeTime = (value: string): string => {
  const parsedValue = parseISO(value)

  if (!isValid(parsedValue)) {
    return "Just now"
  }

  return formatDistanceToNowStrict(parsedValue, {
    addSuffix: true,
  })
}

export const getNotificationDestinationLabel = (
  notification: NotificationSummary,
  hasNavigationTarget: boolean,
): string =>
  hasNavigationTarget
    ? `Open ${getNotificationSymbol(notification) ?? notification.target_type}`
    : "Mark as read"
