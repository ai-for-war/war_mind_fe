import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { textToImageQueryKeys } from "@/features/text-to-image/query-keys"
import { useSocketSubscription, useSocketTransportStore } from "@/features/socket"
import type { ImageGenerationLifecycleEventPayload } from "@/features/text-to-image/types"

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
  const queryClient = useQueryClient()
  const socketStatus = useSocketTransportStore((state) => state.status)
  const lastConnectedAt = useSocketTransportStore((state) => state.lastConnectedAt)
  const lastHandledConnectedAtRef = useRef<number | null>(null)

  const invalidateHistory = (): void => {
    void queryClient.invalidateQueries({
      queryKey: textToImageQueryKeys.historyLists(),
    })
  }

  const invalidateSelectedDetail = (jobId: string): void => {
    void queryClient.invalidateQueries({
      queryKey: textToImageQueryKeys.detail(jobId),
    })
  }

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
  }, [lastConnectedAt, queryClient, selectedJobId, socketStatus])
}
