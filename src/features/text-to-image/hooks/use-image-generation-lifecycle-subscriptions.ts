import { useCallback, useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"
import { useSocketSubscription, useSocketTransportStore } from "@/features/socket"
import type { ImageGenerationLifecycleEventPayload } from "@/features/text-to-image/types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type UseImageGenerationLifecycleSubscriptionsOptions = {
  selectedJobId: string | null
}

const isTerminalOrActiveLifecycleEvent = (status: string): boolean => {
  return (
    status === "processing" ||
    status === "succeeded" ||
    status === "failed" ||
    status === "cancelled"
  )
}

export const useImageGenerationLifecycleSubscriptions = ({
  selectedJobId,
}: UseImageGenerationLifecycleSubscriptionsOptions): void => {
  const activeOrganizationId = useActiveOrganizationId()
  const queryClient = useQueryClient()
  const socketStatus = useSocketTransportStore((state) => state.status)
  const lastConnectedAt = useSocketTransportStore((state) => state.lastConnectedAt)
  const lastHandledConnectedAtRef = useRef<number | null>(null)

  const invalidateHistory = useCallback((): void => {
    void queryClient.invalidateQueries({
      queryKey: textToImageQueryKeys.historyLists(activeOrganizationId),
    })
  }, [activeOrganizationId, queryClient])

  const invalidateSelectedDetail = useCallback((jobId: string): void => {
    void queryClient.invalidateQueries({
      queryKey: textToImageQueryKeys.detail(activeOrganizationId, jobId),
    })
  }, [activeOrganizationId, queryClient])

  useSocketSubscription<ImageGenerationLifecycleEventPayload>(
    "image:generation:created",
    () => {
      invalidateHistory()
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ImageGenerationLifecycleEventPayload>(
    "image:generation:processing",
    ({ job_id, status }) => {
      if (!isTerminalOrActiveLifecycleEvent(status)) {
        return
      }

      invalidateHistory()

      if (selectedJobId && selectedJobId === job_id) {
        invalidateSelectedDetail(selectedJobId)
      }
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ImageGenerationLifecycleEventPayload>(
    "image:generation:succeeded",
    ({ job_id, status }) => {
      if (!isTerminalOrActiveLifecycleEvent(status)) {
        return
      }

      invalidateHistory()

      if (selectedJobId && selectedJobId === job_id) {
        invalidateSelectedDetail(selectedJobId)
      }
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ImageGenerationLifecycleEventPayload>(
    "image:generation:failed",
    ({ job_id, status }) => {
      if (!isTerminalOrActiveLifecycleEvent(status)) {
        return
      }

      invalidateHistory()

      if (selectedJobId && selectedJobId === job_id) {
        invalidateSelectedDetail(selectedJobId)
      }
    },
    { organizationScoped: true },
  )

  useSocketSubscription<ImageGenerationLifecycleEventPayload>(
    "image:generation:cancelled",
    ({ job_id, status }) => {
      if (!isTerminalOrActiveLifecycleEvent(status)) {
        return
      }

      invalidateHistory()

      if (selectedJobId && selectedJobId === job_id) {
        invalidateSelectedDetail(selectedJobId)
      }
    },
    { organizationScoped: true },
  )

  useEffect(() => {
    if (socketStatus !== "connected" || !lastConnectedAt) {
      return
    }

    if (lastHandledConnectedAtRef.current === lastConnectedAt) {
      return
    }

    lastHandledConnectedAtRef.current = lastConnectedAt

    invalidateHistory()

    if (selectedJobId) {
      invalidateSelectedDetail(selectedJobId)
    }
  }, [
    invalidateHistory,
    invalidateSelectedDetail,
    lastConnectedAt,
    selectedJobId,
    socketStatus,
  ])
}
