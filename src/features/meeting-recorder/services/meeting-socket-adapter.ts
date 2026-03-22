import type { MeetingReducerEvent } from "@/features/meeting-recorder/reducers"
import type {
  MeetingAudioFrame,
  MeetingSocketFinalizePayload,
  MeetingSocketStartPayload,
  MeetingSocketStopPayload,
} from "@/features/meeting-recorder/types"
import { getSocketClient, type SharedSocketClient } from "@/features/socket"

type MeetingSocketEventName = MeetingReducerEvent["name"]

type MeetingSocketEventPayloadMap = {
  [TEvent in MeetingReducerEvent as TEvent["name"]]: TEvent["payload"]
}

type MeetingSocketEventHandler = (event: MeetingReducerEvent) => void

type MeetingSocketAdapter = {
  emitAudio: (frame: MeetingAudioFrame) => void
  emitFinalize: (payload: MeetingSocketFinalizePayload) => void
  emitStart: (payload: MeetingSocketStartPayload) => void
  emitStop: (payload: MeetingSocketStopPayload) => void
  isConnected: () => boolean
  subscribe: (handler: MeetingSocketEventHandler) => () => void
}

const MEETING_SOCKET_EVENT_NAMES: MeetingSocketEventName[] = [
  "meeting:started",
  "meeting:final",
  "meeting:utterance_closed",
  "meeting:note:created",
  "meeting:completed",
  "meeting:interrupted",
  "meeting:error",
]

const registerSocketListener = <TEventName extends MeetingSocketEventName>(
  socket: SharedSocketClient,
  eventName: TEventName,
  handler: MeetingSocketEventHandler,
): (() => void) => {
  const listener = (payload: MeetingSocketEventPayloadMap[TEventName]): void => {
    handler({
      name: eventName,
      payload,
    } as MeetingReducerEvent)
  }

  socket.on(eventName, listener)

  return () => {
    socket.off(eventName, listener)
  }
}

export const createMeetingSocketAdapter = (
  socket: SharedSocketClient = getSocketClient(),
): MeetingSocketAdapter => {
  return {
    emitAudio: (frame) => {
      socket.emit("meeting:audio", frame.metadata, frame.payload)
    },
    emitFinalize: (payload) => {
      socket.emit("meeting:finalize", payload)
    },
    emitStart: (payload) => {
      socket.emit("meeting:start", payload)
    },
    emitStop: (payload) => {
      socket.emit("meeting:stop", payload)
    },
    isConnected: () => socket.connected,
    subscribe: (handler) => {
      const unsubscribers = MEETING_SOCKET_EVENT_NAMES.map((eventName) =>
        registerSocketListener(socket, eventName, handler),
      )

      return () => {
        unsubscribers.forEach((unsubscribe) => {
          unsubscribe()
        })
      }
    },
  }
}

export type {
  MeetingSocketAdapter,
  MeetingSocketEventHandler,
  MeetingSocketEventName,
}
