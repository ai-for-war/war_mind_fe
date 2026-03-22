import { useSocketSubscription } from "@/features/socket"
import {
  buildMeetingSessionError,
  type MeetingSessionController,
} from "@/features/meeting-recorder/services"

type UseMeetingRuntimeSubscriptionsOptions = {
  controller: MeetingSessionController
  enabled: boolean
}

export const useMeetingRuntimeSubscriptions = ({
  controller,
  enabled,
}: UseMeetingRuntimeSubscriptionsOptions): void => {
  const handleSocketDisconnect = (reason: string): void => {
    if (!enabled) {
      return
    }

    void controller.teardown({
      emitStop: false,
      error: buildMeetingSessionError(
        "socket_transport_lost",
        `The shared Socket.IO transport disconnected${reason ? `: ${reason}` : "."}`,
        "socket",
      ),
      preserveSessionState: true,
      status: "failed",
    })
  }

  const handleSocketConnectError = (error: unknown): void => {
    if (!enabled) {
      return
    }

    void controller.teardown({
      emitStop: false,
      error: buildMeetingSessionError(
        "socket_transport_error",
        error instanceof Error
          ? error.message
          : "The shared Socket.IO transport failed during the active meeting session.",
        "socket",
      ),
      preserveSessionState: true,
      status: "failed",
    })
  }

  useSocketSubscription<string>("disconnect", handleSocketDisconnect, {
    enabled,
  })
  useSocketSubscription<unknown>("connect_error", handleSocketConnectError, {
    enabled,
  })
}
