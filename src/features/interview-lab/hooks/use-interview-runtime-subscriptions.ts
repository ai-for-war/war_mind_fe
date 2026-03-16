import { useSocketSubscription } from "@/features/socket"
import { buildInterviewMediaError, type InterviewSessionController } from "@/features/interview-lab/services"

type UseInterviewRuntimeSubscriptionsOptions = {
  controller: InterviewSessionController
  enabled: boolean
}

export const useInterviewRuntimeSubscriptions = ({
  controller,
  enabled,
}: UseInterviewRuntimeSubscriptionsOptions): void => {
  const handleSocketDisconnect = (reason: string): void => {
    if (!enabled) {
      return
    }

    void controller.teardown({
      emitStop: false,
      error: buildInterviewMediaError(
        "socket_transport_lost",
        `The shared Socket.IO transport disconnected${reason ? `: ${reason}` : "."}`,
        "socket",
      ),
      preserveSessionState: true,
      status: "failed",
      terminalReason: "runtime_failure",
    })
  }

  const handleSocketConnectError = (error: unknown): void => {
    if (!enabled) {
      return
    }

    void controller.teardown({
      emitStop: false,
      error: buildInterviewMediaError(
        "socket_transport_error",
        error instanceof Error
          ? error.message
          : "The shared Socket.IO transport failed during the active session.",
        "socket",
      ),
      preserveSessionState: true,
      status: "failed",
      terminalReason: "runtime_failure",
    })
  }

  useSocketSubscription<string>("disconnect", handleSocketDisconnect, {
    enabled,
  })
  useSocketSubscription<unknown>("connect_error", handleSocketConnectError, {
    enabled,
  })
}
