import { getSocketClient, type SharedSocketClient } from "@/features/socket"
import type { InterviewReducerEvent } from "@/features/interview-lab/reducers"
import type {
  InterviewAudioFrame,
  InterviewSocketFinalizePayload,
  InterviewSocketStartPayload,
  InterviewSocketStopPayload,
} from "@/features/interview-lab/types"

type InterviewSocketEventName = InterviewReducerEvent["name"]

type InterviewSocketEventPayloadMap = {
  [TEvent in InterviewReducerEvent as TEvent["name"]]: TEvent["payload"]
}

type InterviewSocketEventHandler = (event: InterviewReducerEvent) => void

type InterviewSocketAdapter = {
  emitAudio: (frame: InterviewAudioFrame) => void
  emitFinalize: (payload: InterviewSocketFinalizePayload) => void
  emitStart: (payload: InterviewSocketStartPayload) => void
  emitStop: (payload: InterviewSocketStopPayload) => void
  isConnected: () => boolean
  subscribe: (handler: InterviewSocketEventHandler) => () => void
}

const INTERVIEW_SOCKET_EVENT_NAMES: InterviewSocketEventName[] = [
  "stt:started",
  "stt:partial",
  "stt:final",
  "stt:utterance_closed",
  "stt:completed",
  "stt:error",
  "interview:answer:started",
  "interview:answer:token",
  "interview:answer:completed",
  "interview:answer",
  "interview:answer:failed",
]

const registerSocketListener = <TEventName extends InterviewSocketEventName>(
  socket: SharedSocketClient,
  eventName: TEventName,
  handler: InterviewSocketEventHandler,
): (() => void) => {
  const listener = (
    payload: InterviewSocketEventPayloadMap[TEventName],
  ): void => {
    handler({
      name: eventName,
      payload,
    } as InterviewReducerEvent)
  }

  socket.on(eventName, listener)

  return () => {
    socket.off(eventName, listener)
  }
}

export const createInterviewSocketAdapter = (
  socket: SharedSocketClient = getSocketClient(),
): InterviewSocketAdapter => {
  return {
    emitAudio: (frame) => {
      socket.emit("stt:audio", frame.metadata, frame.payload)
    },
    emitFinalize: (payload) => {
      socket.emit("stt:finalize", payload)
    },
    emitStart: (payload) => {
      socket.emit("stt:start", payload)
    },
    emitStop: (payload) => {
      socket.emit("stt:stop", payload)
    },
    isConnected: () => socket.connected,
    subscribe: (handler) => {
      const unsubscribers = INTERVIEW_SOCKET_EVENT_NAMES.map((eventName) =>
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

export type { InterviewSocketAdapter, InterviewSocketEventHandler, InterviewSocketEventName }

