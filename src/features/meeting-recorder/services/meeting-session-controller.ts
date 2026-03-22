import {
  MEETING_AUDIO_METADATA_DEFAULTS,
  MEETING_DEFAULT_LANGUAGE,
  MEETING_SOURCE_ROLES,
} from "@/features/meeting-recorder/constants"
import {
  applyMeetingSessionStoreActions,
  reduceMeetingEvent,
  type MeetingReducerEvent,
} from "@/features/meeting-recorder/reducers"
import {
  createMeetingSocketAdapter,
  type MeetingSocketAdapter,
} from "@/features/meeting-recorder/services/meeting-socket-adapter"
import { useMeetingSessionStore } from "@/features/meeting-recorder/stores"
import type {
  MeetingAudioFrame,
  MeetingAudioLanguage,
  MeetingSessionError,
  MeetingSessionIdentifiers,
  MeetingSessionState,
  MeetingSessionStatus,
  MeetingSocketStartPayload,
  MeetingSourceReadinessState,
  MeetingSourceRole,
} from "@/features/meeting-recorder/types"
import {
  generateMeetingStreamId,
  guardMeetingInboundEvent,
} from "@/features/meeting-recorder/utils"
import { useOrganizationStore } from "@/stores/use-organization-store"

const DEFAULT_MEETING_START_ACK_TIMEOUT_MS = 15_000

const ACTIVE_MEETING_SESSION_STATUSES = new Set<MeetingSessionStatus>([
  "preparing_media",
  "media_ready",
  "starting",
  "streaming",
  "finalizing",
])

const REMOTE_MEETING_SESSION_STATUSES = new Set<MeetingSessionStatus>([
  "starting",
  "streaming",
  "finalizing",
])

type MeetingFrameEmitter = (frame: MeetingAudioFrame) => Promise<void> | void

type PreparedMeetingMediaSession = {
  sourceReadiness: Record<MeetingSourceRole, MeetingSourceReadinessState>
  startStreaming: (emitFrame: MeetingFrameEmitter) => Promise<void> | void
  stopStreaming: () => Promise<void> | void
  teardown: () => Promise<void> | void
}

type MeetingMediaPreparationOptions = {
  identifiers: MeetingSessionIdentifiers
  onDependencyLoss: (error: MeetingSessionError) => void
}

type MeetingMediaRuntime = {
  prepareSession: (
    options: MeetingMediaPreparationOptions,
  ) => Promise<PreparedMeetingMediaSession>
}

type StartMeetingSessionOptions = {
  language?: MeetingAudioLanguage
  title?: string | null
}

type MeetingSessionController = {
  dispose: () => Promise<void>
  getSnapshot: () => MeetingSessionState
  reset: () => Promise<void>
  start: (options?: StartMeetingSessionOptions) => Promise<void>
  stop: () => Promise<void>
  teardown: (options?: MeetingControllerTeardownOptions) => Promise<void>
}

type MeetingControllerPendingStart = {
  identifiers: MeetingSessionIdentifiers
  reject: (error: Error) => void
  resolve: () => void
  timeoutId: ReturnType<typeof setTimeout>
  token: number
}

type MeetingControllerTeardownOptions = {
  emitStop?: boolean
  error?: MeetingSessionError | null
  preserveSessionState?: boolean
  status?: MeetingSessionState["status"]
}

type CreateMeetingSessionControllerOptions = {
  mediaRuntime: MeetingMediaRuntime
  socketAdapter?: MeetingSocketAdapter
  startAckTimeoutMs?: number
}

const readActiveOrganizationId = (): string | null => {
  return useOrganizationStore.getState().activeOrganization?.organization.id ?? null
}

const hasValue = (value: unknown): value is string => {
  return typeof value === "string" && value.length > 0
}

const normalizeOptionalTitle = (title: string | null | undefined): string | undefined => {
  if (typeof title !== "string") {
    return undefined
  }

  const normalizedTitle = title.trim()

  return normalizedTitle.length > 0 ? normalizedTitle : undefined
}

export const buildMeetingSessionError = (
  code: string,
  message: string,
  source: MeetingSessionError["source"],
  retryable = false,
): MeetingSessionError => {
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

const isMeetingSessionError = (error: unknown): error is MeetingSessionError => {
  if (!error || typeof error !== "object") {
    return false
  }

  const candidate = error as Partial<MeetingSessionError>

  return (
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.retryable === "boolean" &&
    typeof candidate.source === "string" &&
    typeof candidate.timestamp === "number"
  )
}

const toStartPayload = (
  identifiers: MeetingSessionIdentifiers,
  language: MeetingAudioLanguage,
  title?: string | null,
): MeetingSocketStartPayload => {
  const normalizedTitle = normalizeOptionalTitle(title)

  return {
    organization_id: identifiers.organizationId,
    stream_id: identifiers.streamId,
    language,
    encoding: MEETING_AUDIO_METADATA_DEFAULTS.encoding,
    sample_rate: MEETING_AUDIO_METADATA_DEFAULTS.sampleRate,
    channels: MEETING_AUDIO_METADATA_DEFAULTS.channels,
    ...(normalizedTitle ? { title: normalizedTitle } : {}),
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

export const createMeetingSessionController = ({
  mediaRuntime,
  socketAdapter = createMeetingSocketAdapter(),
  startAckTimeoutMs = DEFAULT_MEETING_START_ACK_TIMEOUT_MS,
}: CreateMeetingSessionControllerOptions): MeetingSessionController => {
  let currentMediaSession: PreparedMeetingMediaSession | null = null
  let pendingStart: MeetingControllerPendingStart | null = null
  let unsubscribeSocketEvents: (() => void) | null = null
  let requestedStreamId: string | null = null
  let acceptedStreamId: string | null = null
  let pendingFinalizeStreamId: string | null = null
  let mediaStreamingStopped = false
  let isDisposed = false
  let lifecycleToken = 0

  const readSnapshot = (): MeetingSessionState => {
    return useMeetingSessionStore.getState()
  }

  const readStore = () => {
    return useMeetingSessionStore.getState()
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
    identifiers: MeetingSessionIdentifiers,
    token: number,
  ): Promise<void> => {
    clearPendingStart(
      new Error("Superseded by a newer meeting session startup attempt."),
    )

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (!pendingStart || pendingStart.token !== token) {
          return
        }

        clearPendingStart(
          new Error(
            "Timed out while waiting for the backend to confirm the meeting session.",
          ),
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

  const applyReducerEvent = (event: MeetingReducerEvent): void => {
    const snapshot = readSnapshot()
    const actions = reduceMeetingEvent(
      {
        committedUtterances: snapshot.committedUtterances,
        identifiers: snapshot.identifiers,
        status: snapshot.status,
      },
      event,
    )

    applyMeetingSessionStoreActions(readStore(), actions)
  }

  const isMatchingMeetingErrorEvent = (
    event: Extract<MeetingReducerEvent, { name: "meeting:error" }>,
    activeIdentifiers: MeetingSessionIdentifiers,
  ): boolean => {
    if (
      !guardMeetingInboundEvent(event.payload, activeIdentifiers, {
        requireMeetingId: false,
        requireStreamId: false,
      })
    ) {
      return false
    }

    const matchesStreamId =
      hasValue(event.payload.stream_id) &&
      event.payload.stream_id === activeIdentifiers.streamId

    const matchesMeetingId =
      activeIdentifiers.meetingId !== null &&
      hasValue(event.payload.meeting_id) &&
      event.payload.meeting_id === activeIdentifiers.meetingId

    return matchesStreamId || matchesMeetingId
  }

  const isMatchingActiveSessionEvent = (
    event: MeetingReducerEvent,
    activeIdentifiers: MeetingSessionIdentifiers | null,
  ): boolean => {
    if (!activeIdentifiers) {
      return false
    }

    const activeOrganizationId = readActiveOrganizationId()

    if (
      !activeOrganizationId ||
      activeOrganizationId !== activeIdentifiers.organizationId
    ) {
      return false
    }

    switch (event.name) {
      case "meeting:started":
        return Boolean(
          pendingStart &&
            pendingStart.identifiers.streamId === activeIdentifiers.streamId &&
            guardMeetingInboundEvent(event.payload, activeIdentifiers, {
              requireMeetingId: false,
              requireStreamId: true,
            }),
        )

      case "meeting:note:created":
        return guardMeetingInboundEvent(event.payload, activeIdentifiers, {
          requireMeetingId: true,
          requireStreamId: false,
        })

      case "meeting:error":
        return isMatchingMeetingErrorEvent(event, activeIdentifiers)

      default:
        return guardMeetingInboundEvent(event.payload, activeIdentifiers, {
          requireMeetingId: activeIdentifiers.meetingId !== null,
          requireStreamId: true,
        })
    }
  }

  const stopLiveStreaming = async (): Promise<void> => {
    if (!currentMediaSession || mediaStreamingStopped) {
      return
    }

    mediaStreamingStopped = true
    await settleAsyncTask(currentMediaSession.stopStreaming)
  }

  const releaseMediaResources = async (): Promise<void> => {
    if (!currentMediaSession) {
      return
    }

    const mediaSession = currentMediaSession
    const shouldStopStreaming = !mediaStreamingStopped

    currentMediaSession = null
    mediaStreamingStopped = true

    if (shouldStopStreaming) {
      try {
        await settleAsyncTask(mediaSession.stopStreaming)
      } catch {
        // Ignore cleanup failures after the meeting runtime is already terminal.
      }
    }

    try {
      await settleAsyncTask(mediaSession.teardown)
    } catch {
      // Ignore cleanup failures after the meeting runtime is already terminal.
    }
  }

  const applySourceReadiness = (
    sourceReadiness: Record<MeetingSourceRole, MeetingSourceReadinessState>,
  ): void => {
    const store = readStore()

    MEETING_SOURCE_ROLES.forEach((role) => {
      store.setSourceReadiness(role, sourceReadiness[role])
    })
  }

  const applyErrorSourceState = (
    error: MeetingSessionError,
    status: MeetingSourceReadinessState["status"],
  ): void => {
    const store = readStore()

    if (error.source === "meeting_tab") {
      store.setSourceReadiness("meeting_tab", {
        status,
        isReady: false,
        error: error.message,
      })
      return
    }

    if (error.source === "microphone") {
      store.setSourceReadiness("microphone", {
        status,
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
  }: MeetingControllerTeardownOptions = {}): Promise<void> => {
    lifecycleToken += 1

    const snapshot = readSnapshot()
    const identifiers = snapshot.identifiers
    const hasRemoteSession =
      identifiers !== null &&
      (requestedStreamId === identifiers.streamId ||
        acceptedStreamId === identifiers.streamId)
    const shouldEmitStop =
      emitStop &&
      identifiers !== null &&
      hasRemoteSession &&
      socketAdapter.isConnected()

    clearPendingStart(new Error("Meeting session startup was cancelled."))

    if (preserveSessionState) {
      if (error !== undefined) {
        readStore().setTerminalError(error)
      }

      if (status) {
        readStore().setStatus(status)
      }
    }

    requestedStreamId = null
    acceptedStreamId = null
    pendingFinalizeStreamId = null

    if (shouldEmitStop && identifiers) {
      try {
        socketAdapter.emitStop({
          stream_id: identifiers.streamId,
        })
      } catch {
        // Ignore transport emit failures during teardown; local cleanup still must finish.
      }
    }

    await releaseMediaResources()

    if (!preserveSessionState) {
      readStore().resetSession()
    }
  }

  const handleDependencyLoss = (token: number) => {
    return (error: MeetingSessionError): void => {
      if (token !== lifecycleToken || isDisposed) {
        return
      }

      applyErrorSourceState(error, "ended")

      void teardownSession({
        emitStop: true,
        error,
        preserveSessionState: true,
        status: "failed",
      })
    }
  }

  const handleInboundEvent = async (event: MeetingReducerEvent): Promise<void> => {
    const snapshot = readSnapshot()

    if (!isMatchingActiveSessionEvent(event, snapshot.identifiers)) {
      return
    }

    applyReducerEvent(event)

    if (event.name === "meeting:started") {
      acceptedStreamId = event.payload.stream_id
      requestedStreamId = event.payload.stream_id

      if (
        pendingStart &&
        pendingStart.identifiers.organizationId === event.payload.organization_id &&
        pendingStart.identifiers.streamId === event.payload.stream_id
      ) {
        clearPendingStart()
      }

      if (pendingFinalizeStreamId === event.payload.stream_id) {
        readStore().setStatus("finalizing")
      }

      return
    }

    if (
      event.name === "meeting:completed" ||
      event.name === "meeting:interrupted" ||
      event.name === "meeting:error"
    ) {
      // Terminal lifecycle events stop live capture/upload, but note listeners stay subscribed.
      clearPendingStart()
      requestedStreamId = null
      acceptedStreamId = null
      pendingFinalizeStreamId = null
      await releaseMediaResources()
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
    startOptions?: StartMeetingSessionOptions,
  ): Promise<void> => {
    if (isDisposed) {
      throw new Error("Meeting session controller has already been disposed.")
    }

    const snapshot = readSnapshot()

    if (ACTIVE_MEETING_SESSION_STATUSES.has(snapshot.status)) {
      throw new Error("A meeting session is already active for this controller.")
    }

    ensureSocketSubscriptions()

    if (!socketAdapter.isConnected()) {
      const error = buildMeetingSessionError(
        "socket_unavailable",
        "The shared Socket.IO transport is not connected.",
        "socket",
      )
      const store = readStore()

      store.setTerminalError(error)
      store.setStatus("failed")
      return
    }

    const organizationId = readActiveOrganizationId()

    if (!organizationId) {
      const error = buildMeetingSessionError(
        "organization_unavailable",
        "An active organization is required before starting a meeting recorder session.",
        "organization",
      )
      const store = readStore()

      store.setTerminalError(error)
      store.setStatus("failed")
      return
    }

    if (snapshot.status !== "idle") {
      readStore().resetSession()
    }

    lifecycleToken += 1
    const token = lifecycleToken
    const language = startOptions?.language ?? MEETING_DEFAULT_LANGUAGE
    const identifiers: MeetingSessionIdentifiers = {
      organizationId,
      streamId: generateMeetingStreamId(),
      meetingId: null,
    }
    const store = readStore()

    requestedStreamId = null
    acceptedStreamId = null
    pendingFinalizeStreamId = null
    store.setAcceptedConfig(null)
    store.setTerminalError(null)
    store.setIdentifiers(identifiers)
    store.setStatus("preparing_media")

    MEETING_SOURCE_ROLES.forEach((role) => {
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
      mediaStreamingStopped = false

      if (token !== lifecycleToken || isDisposed) {
        await releaseMediaResources()
        return
      }

      applySourceReadiness(currentMediaSession.sourceReadiness)
      store.setStatus("media_ready")

      const waitForStartAcknowledgement = createPendingStart(identifiers, token)

      store.setStatus("starting")
      socketAdapter.emitStart(
        toStartPayload(identifiers, language, startOptions?.title),
      )
      requestedStreamId = identifiers.streamId

      await waitForStartAcknowledgement

      if (token !== lifecycleToken || isDisposed || !currentMediaSession) {
        return
      }

      const latestSnapshot = readSnapshot()

      if (
        latestSnapshot.status !== "streaming" ||
        acceptedStreamId !== identifiers.streamId
      ) {
        return
      }

      await Promise.resolve(
        currentMediaSession.startStreaming((frame) => {
          const liveSnapshot = readSnapshot()

          if (
            token !== lifecycleToken ||
            isDisposed ||
            liveSnapshot.status !== "streaming" ||
            !liveSnapshot.identifiers ||
            liveSnapshot.identifiers.streamId !== identifiers.streamId ||
            acceptedStreamId !== identifiers.streamId ||
            !socketAdapter.isConnected()
          ) {
            return
          }

          socketAdapter.emitAudio(frame)
        }),
      )
    } catch (error) {
      if (token !== lifecycleToken) {
        return
      }

      const sessionError = isMeetingSessionError(error)
        ? error
        : buildMeetingSessionError(
            "session_start_failed",
            toErrorMessage(
              error,
              "Failed to prepare and start the meeting recorder session.",
            ),
            "runtime",
          )

      applyErrorSourceState(sessionError, "failed")

      await teardownSession({
        emitStop: true,
        error: sessionError,
        preserveSessionState: true,
        status: "failed",
      })
    }
  }

  const stop = async (): Promise<void> => {
    const snapshot = readSnapshot()

    if (!snapshot.identifiers && !currentMediaSession) {
      return
    }

    if (!ACTIVE_MEETING_SESSION_STATUSES.has(snapshot.status)) {
      return
    }

    if (!snapshot.identifiers) {
      await teardownSession({
        emitStop: false,
        error: null,
        preserveSessionState: true,
        status: "stopped",
      })
      return
    }

    if (!REMOTE_MEETING_SESSION_STATUSES.has(snapshot.status)) {
      await teardownSession({
        emitStop: false,
        error: null,
        preserveSessionState: true,
        status: "stopped",
      })
      return
    }

    if (snapshot.status === "finalizing") {
      return
    }

    if (!socketAdapter.isConnected()) {
      await teardownSession({
        emitStop: false,
        error: buildMeetingSessionError(
          "socket_unavailable",
          "The shared Socket.IO transport is not connected.",
          "socket",
        ),
        preserveSessionState: true,
        status: "failed",
      })
      return
    }

    try {
      socketAdapter.emitFinalize({
        stream_id: snapshot.identifiers.streamId,
      })

      pendingFinalizeStreamId = snapshot.identifiers.streamId
      readStore().setTerminalError(null)
      readStore().setStatus("finalizing")

      await stopLiveStreaming()
    } catch (error) {
      await teardownSession({
        emitStop: true,
        error: buildMeetingSessionError(
          "session_finalize_failed",
          toErrorMessage(error, "Failed to finalize the active meeting session."),
          "runtime",
        ),
        preserveSessionState: true,
        status: "failed",
      })
    }
  }

  const reset = async (): Promise<void> => {
    await teardownSession({
      emitStop: true,
      preserveSessionState: false,
    })
  }

  const teardown = async (
    options?: MeetingControllerTeardownOptions,
  ): Promise<void> => {
    await teardownSession({
      emitStop: true,
      error: null,
      preserveSessionState: true,
      status: "stopped",
      ...options,
    })
  }

  const dispose = async (): Promise<void> => {
    if (isDisposed) {
      return
    }

    await teardownSession({
      emitStop: true,
      preserveSessionState: false,
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
  CreateMeetingSessionControllerOptions,
  MeetingControllerTeardownOptions,
  MeetingMediaPreparationOptions,
  MeetingMediaRuntime,
  MeetingSessionController,
  PreparedMeetingMediaSession,
  StartMeetingSessionOptions,
}
