import {
  INTERVIEW_AUDIO_METADATA_DEFAULTS,
  INTERVIEW_CHANNEL_MAP,
  INTERVIEW_DEFAULT_LANGUAGE,
} from "@/features/interview-lab/constants"
import {
  applyInterviewSessionStoreActions,
  reduceInterviewEvent,
  type InterviewReducerEvent,
} from "@/features/interview-lab/reducers"
import { createInterviewSocketAdapter, type InterviewSocketAdapter } from "@/features/interview-lab/services/interview-socket-adapter"
import { useInterviewSessionStore } from "@/features/interview-lab/stores"
import type {
  InterviewAudioFrame,
  InterviewAudioLanguage,
  InterviewSessionError,
  InterviewSessionIdentifiers,
  InterviewSessionState,
  InterviewSessionTerminalReason,
  InterviewSocketStartPayload,
  InterviewSourceReadinessState,
  InterviewSourceRole,
} from "@/features/interview-lab/types"
import {
  generateInterviewConversationId,
  generateInterviewStreamId,
  guardInterviewInboundEvent,
} from "@/features/interview-lab/utils"

const DEFAULT_INTERVIEW_START_ACK_TIMEOUT_MS = 15_000

const ACTIVE_INTERVIEW_SESSION_STATUSES = new Set([
  "preparing_media",
  "media_ready",
  "starting",
  "streaming",
  "finalizing",
  "stopping",
])
const INTERVIEW_SOURCE_ROLES = ["interviewer", "user"] as const

type InterviewFrameEmitter = (frame: InterviewAudioFrame) => Promise<void> | void

type PreparedInterviewMediaSession = {
  sourceReadiness: Record<InterviewSourceRole, InterviewSourceReadinessState>
  startStreaming: (emitFrame: InterviewFrameEmitter) => Promise<void> | void
  stopStreaming: () => Promise<void> | void
  teardown: () => Promise<void> | void
}

type InterviewMediaPreparationOptions = {
  identifiers: InterviewSessionIdentifiers
  onDependencyLoss: (error: InterviewSessionError) => void
}

type InterviewMediaRuntime = {
  prepareSession: (
    options: InterviewMediaPreparationOptions,
  ) => Promise<PreparedInterviewMediaSession>
}

type StartInterviewSessionOptions = {
  language?: InterviewAudioLanguage
}

type InterviewSessionController = {
  dispose: () => Promise<void>
  getSnapshot: () => InterviewSessionState
  reset: () => Promise<void>
  start: (options?: StartInterviewSessionOptions) => Promise<void>
  stop: () => Promise<void>
  teardown: (options?: InterviewControllerTeardownOptions) => Promise<void>
}

type InterviewControllerPendingStart = {
  identifiers: InterviewSessionIdentifiers
  reject: (error: Error) => void
  resolve: () => void
  timeoutId: ReturnType<typeof setTimeout>
  token: number
}

type InterviewControllerTeardownOptions = {
  emitStop?: boolean
  error?: InterviewSessionError | null
  preserveSessionState?: boolean
  status?: InterviewSessionState["status"]
  terminalReason?: InterviewSessionTerminalReason | null
}

type CreateInterviewSessionControllerOptions = {
  mediaRuntime: InterviewMediaRuntime
  socketAdapter?: InterviewSocketAdapter
  startAckTimeoutMs?: number
}

const buildControllerError = (
  code: string,
  message: string,
  source: InterviewSessionError["source"],
  retryable = false,
): InterviewSessionError => {
  return {
    code,
    message,
    retryable,
    source,
    timestamp: Date.now(),
  }
}

const toErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === "string" && error.length > 0) {
    return error
  }

  return fallbackMessage
}

const isInterviewSessionError = (
  error: unknown,
): error is InterviewSessionError => {
  if (!error || typeof error !== "object") {
    return false
  }

  const candidate = error as Partial<InterviewSessionError>

  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.retryable === "boolean" &&
    typeof candidate.source === "string" &&
    typeof candidate.timestamp === "number"
  )
}

const toStartPayload = (
  identifiers: InterviewSessionIdentifiers,
  language: InterviewAudioLanguage,
): InterviewSocketStartPayload => {
  return {
    stream_id: identifiers.streamId,
    conversation_id: identifiers.conversationId,
    language,
    encoding: INTERVIEW_AUDIO_METADATA_DEFAULTS.encoding,
    sample_rate: INTERVIEW_AUDIO_METADATA_DEFAULTS.sampleRate,
    channels: INTERVIEW_AUDIO_METADATA_DEFAULTS.channels,
    channel_map: INTERVIEW_CHANNEL_MAP,
  }
}

const settleAsyncTask = async (
  task: (() => Promise<void> | void) | undefined,
): Promise<void> => {
  if (!task) {
    return
  }

  await Promise.resolve(task())
}

export const createInterviewSessionController = ({
  mediaRuntime,
  socketAdapter = createInterviewSocketAdapter(),
  startAckTimeoutMs = DEFAULT_INTERVIEW_START_ACK_TIMEOUT_MS,
}: CreateInterviewSessionControllerOptions): InterviewSessionController => {
  let currentMediaSession: PreparedInterviewMediaSession | null = null
  let pendingStart: InterviewControllerPendingStart | null = null
  let unsubscribeSocketEvents: (() => void) | null = null
  let acceptedStreamId: string | null = null
  let isDisposed = false
  let lifecycleToken = 0

  const readSnapshot = (): InterviewSessionState => {
    return useInterviewSessionStore.getState()
  }

  const readStore = () => {
    return useInterviewSessionStore.getState()
  }

  const clearPendingStart = (error?: Error): void => {
    if (!pendingStart) {
      return
    }

    clearTimeout(pendingStart.timeoutId)

    const currentPendingStart = pendingStart
    pendingStart = null

    if (error) {
      currentPendingStart.reject(error)
      return
    }

    currentPendingStart.resolve()
  }

  const createPendingStart = (
    identifiers: InterviewSessionIdentifiers,
    token: number,
  ): Promise<void> => {
    clearPendingStart(
      new Error("Superseded by a newer interview session startup attempt."),
    )

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!pendingStart || pendingStart.token !== token) {
          return
        }

        clearPendingStart(
          new Error("Timed out while waiting for the backend to confirm the interview session."),
        )
      }, startAckTimeoutMs)

      pendingStart = {
        identifiers,
        reject,
        resolve,
        timeoutId,
        token,
      }
    })
  }

  const applyReducerEvent = (event: InterviewReducerEvent): void => {
    const snapshot = readSnapshot()
    const actions = reduceInterviewEvent(
      {
        aiAnswers: snapshot.aiAnswers,
        openUtterances: snapshot.openUtterances,
      },
      event,
    )

    applyInterviewSessionStoreActions(readStore(), actions)
  }

  const isMatchingActiveSessionEvent = (
    event: InterviewReducerEvent,
    activeIdentifiers: InterviewSessionIdentifiers | null,
  ): boolean => {
    if (!activeIdentifiers) {
      return false
    }

    if (event.name === "stt:error") {
      const payload = event.payload
      const hasMatchingStreamId =
        typeof payload.stream_id === "string" &&
        payload.stream_id === activeIdentifiers.streamId
      const hasMatchingConversationId =
        typeof payload.conversation_id === "string" &&
        payload.conversation_id === activeIdentifiers.conversationId

      return hasMatchingStreamId || hasMatchingConversationId
    }

    return guardInterviewInboundEvent(
      event.payload,
      activeIdentifiers,
    )
  }

  const releaseMediaResources = async (): Promise<void> => {
    if (!currentMediaSession) {
      return
    }

    const sessionToRelease = currentMediaSession
    currentMediaSession = null

    await settleAsyncTask(sessionToRelease.stopStreaming)
    await settleAsyncTask(sessionToRelease.teardown)
  }

  const applySourceReadiness = (
    sourceReadiness: Record<InterviewSourceRole, InterviewSourceReadinessState>,
  ): void => {
    const store = readStore()

    INTERVIEW_SOURCE_ROLES.forEach((role) => {
      store.setSourceReadiness(role, sourceReadiness[role])
    })
  }

  const applyStartupFailureSourceState = (
    error: InterviewSessionError,
  ): void => {
    const store = readStore()

    if (error.source === "microphone") {
      store.setSourceReadiness("user", {
        status: "failed",
        isReady: false,
        error: error.message,
      })
      return
    }

    if (error.source === "interviewer_tab") {
      store.setSourceReadiness("interviewer", {
        status: "failed",
        isReady: false,
        error: error.message,
      })
    }
  }

  const teardownSession = async ({
    emitStop = true,
    error,
    preserveSessionState = true,
    status,
    terminalReason,
  }: InterviewControllerTeardownOptions = {}): Promise<void> => {
    lifecycleToken += 1

    const snapshot = readSnapshot()
    const identifiers = snapshot.identifiers
    const shouldEmitStop =
      emitStop &&
      Boolean(identifiers) &&
      acceptedStreamId !== null &&
      acceptedStreamId === identifiers?.streamId &&
      socketAdapter.isConnected()

    clearPendingStart(new Error("Interview session startup was cancelled."))

    if (shouldEmitStop && identifiers) {
      try {
        socketAdapter.emitStop({
          stream_id: identifiers.streamId,
        })
      } catch {
        // Ignore transport emit failures during teardown; local cleanup still must finish.
      }
    }

    acceptedStreamId = null

    await releaseMediaResources()

    if (!preserveSessionState) {
      readStore().resetSession()
      return
    }

    readStore().setIdentifiers(null)

    if (error !== undefined) {
      readStore().setSessionError(error)
    }

    if (terminalReason !== undefined) {
      readStore().setTerminalReason(terminalReason)
    }

    if (status) {
      readStore().setStatus(status)
    }
  }

  const handleDependencyLoss = (token: number) => {
    return (error: InterviewSessionError): void => {
      if (token !== lifecycleToken || isDisposed) {
        return
      }

      void teardownSession({
        emitStop: true,
        error,
        preserveSessionState: true,
        status: "failed",
        terminalReason: "runtime_failure",
      })
    }
  }

  const handleInboundEvent = async (
    event: InterviewReducerEvent,
  ): Promise<void> => {
    const snapshot = readSnapshot()

    if (!isMatchingActiveSessionEvent(event, snapshot.identifiers)) {
      return
    }

    applyReducerEvent(event)

    if (event.name === "stt:started") {
      acceptedStreamId = event.payload.stream_id

      if (
        pendingStart &&
        pendingStart.identifiers.streamId === event.payload.stream_id &&
        pendingStart.identifiers.conversationId === event.payload.conversation_id
      ) {
        clearPendingStart()
      }

      return
    }

    if (event.name === "stt:completed") {
      await teardownSession({
        emitStop: false,
        preserveSessionState: true,
      })
      return
    }

    if (event.name === "stt:error") {
      await teardownSession({
        emitStop: false,
        preserveSessionState: true,
      })
    }
  }

  const ensureSocketSubscriptions = (): void => {
    if (unsubscribeSocketEvents) {
      return
    }

    unsubscribeSocketEvents = socketAdapter.subscribe((event) => {
      void handleInboundEvent(event)
    })
  }

  const start = async (
    startOptions?: StartInterviewSessionOptions,
  ): Promise<void> => {
    if (isDisposed) {
      throw new Error("Interview session controller has already been disposed.")
    }

    const snapshot = readSnapshot()

    if (ACTIVE_INTERVIEW_SESSION_STATUSES.has(snapshot.status)) {
      throw new Error("An interview session is already active for this controller.")
    }

    ensureSocketSubscriptions()

    if (!socketAdapter.isConnected()) {
      const error = buildControllerError(
        "socket_unavailable",
        "The shared Socket.IO transport is not connected.",
        "socket",
      )
      const store = readStore()

      store.setSessionError(error)
      store.setTerminalReason("runtime_failure")
      store.setStatus("failed")
      return
    }

    if (snapshot.status !== "idle") {
      readStore().resetSession()
    }

    lifecycleToken += 1
    const token = lifecycleToken
    const language =
      startOptions?.language ?? INTERVIEW_DEFAULT_LANGUAGE
    const identifiers: InterviewSessionIdentifiers = {
      conversationId: generateInterviewConversationId(),
      streamId: generateInterviewStreamId(),
    }
    const store = readStore()

    acceptedStreamId = null
    store.setSessionError(null)
    store.setTerminalReason(null)
    store.setAcceptedConfig(null)
    store.setIdentifiers(identifiers)
    store.setStatus("preparing_media")

    INTERVIEW_SOURCE_ROLES.forEach((role) => {
      store.setSourceReadiness(role, {
        status: "requesting",
        isReady: false,
        error: null,
      })
    })

    try {
      currentMediaSession = await mediaRuntime.prepareSession({
        identifiers,
        onDependencyLoss: handleDependencyLoss(token),
      })

      if (token !== lifecycleToken || isDisposed) {
        await releaseMediaResources()
        return
      }

      applySourceReadiness(currentMediaSession.sourceReadiness)
      store.setStatus("media_ready")

      const waitForStartAcknowledgement = createPendingStart(identifiers, token)

      store.setStatus("starting")
      socketAdapter.emitStart(toStartPayload(identifiers, language))

      await waitForStartAcknowledgement

      if (token !== lifecycleToken || isDisposed || !currentMediaSession) {
        return
      }

      await Promise.resolve(
        currentMediaSession.startStreaming((frame) => {
          if (token !== lifecycleToken || !socketAdapter.isConnected()) {
            return
          }

          socketAdapter.emitAudio(frame)
        }),
      )
    } catch (error) {
      if (token !== lifecycleToken) {
        return
      }

      const sessionError = isInterviewSessionError(error)
        ? error
        : buildControllerError(
            "session_start_failed",
            toErrorMessage(
              error,
              "Failed to prepare and start the interview session.",
            ),
            "runtime",
          )

      applyStartupFailureSourceState(sessionError)

      await teardownSession({
        emitStop: false,
        error: sessionError,
        preserveSessionState: true,
        status: "failed",
        terminalReason: "runtime_failure",
      })
    }
  }

  const stop = async (): Promise<void> => {
    const snapshot = readSnapshot()

    if (!snapshot.identifiers && !currentMediaSession) {
      return
    }

    readStore().setStatus("stopping")

    await teardownSession({
      emitStop: true,
      error: null,
      preserveSessionState: true,
      status: "stopped",
      terminalReason: "user_stop",
    })
  }

  const reset = async (): Promise<void> => {
    const snapshot = readSnapshot()

    if (ACTIVE_INTERVIEW_SESSION_STATUSES.has(snapshot.status)) {
      await stop()
    }

    await teardownSession({
      emitStop: false,
      preserveSessionState: false,
    })
  }

  const teardown = async (
    options?: InterviewControllerTeardownOptions,
  ): Promise<void> => {
    await teardownSession({
      emitStop: true,
      error: null,
      preserveSessionState: true,
      status: "stopped",
      terminalReason: "user_stop",
      ...options,
    })
  }

  const dispose = async (): Promise<void> => {
    if (isDisposed) {
      return
    }

    await teardownSession({
      emitStop: true,
      error: null,
      preserveSessionState: true,
      status: "stopped",
      terminalReason: "user_stop",
    })

    unsubscribeSocketEvents?.()
    unsubscribeSocketEvents = null
    isDisposed = true
  }

  return {
    dispose,
    getSnapshot: readSnapshot,
    reset,
    start,
    stop,
    teardown,
  }
}

export type {
  CreateInterviewSessionControllerOptions,
  InterviewControllerTeardownOptions,
  InterviewMediaPreparationOptions,
  InterviewMediaRuntime,
  InterviewSessionController,
  PreparedInterviewMediaSession,
  StartInterviewSessionOptions,
}
