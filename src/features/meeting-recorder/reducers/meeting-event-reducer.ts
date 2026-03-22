import type { MeetingSessionActions } from "@/features/meeting-recorder/stores"
import type {
  MeetingAcceptedSessionConfig,
  MeetingClosedUtterance,
  MeetingDraftUtterance,
  MeetingNoteActionItem,
  MeetingNoteChunk,
  MeetingSessionError,
  MeetingSessionIdentifiers,
  MeetingSessionState,
  MeetingSessionStatus,
  MeetingSocketTranscriptMessage,
  MeetingStartedPayload,
  MeetingFinalPayload,
  MeetingUtteranceClosedPayload,
  MeetingNoteCreatedPayload,
  MeetingCompletedPayload,
  MeetingInterruptedPayload,
  MeetingErrorPayload,
  MeetingTranscriptMessage,
} from "@/features/meeting-recorder/types"

type MeetingReducerState = Pick<
  MeetingSessionState,
  "committedUtterances" | "identifiers" | "status"
>

type MeetingReducerEvent =
  | { name: "meeting:started"; payload: MeetingStartedPayload }
  | { name: "meeting:final"; payload: MeetingFinalPayload }
  | { name: "meeting:utterance_closed"; payload: MeetingUtteranceClosedPayload }
  | { name: "meeting:note:created"; payload: MeetingNoteCreatedPayload }
  | { name: "meeting:completed"; payload: MeetingCompletedPayload }
  | { name: "meeting:interrupted"; payload: MeetingInterruptedPayload }
  | { name: "meeting:error"; payload: MeetingErrorPayload }

type MeetingSessionStoreAction =
  | { type: "append-committed-utterance"; utterance: MeetingClosedUtterance }
  | { type: "noop" }
  | { type: "patch-identifiers"; value: Partial<MeetingSessionIdentifiers> }
  | { type: "set-accepted-config"; acceptedConfig: MeetingAcceptedSessionConfig | null }
  | { type: "set-draft-utterance"; utterance: MeetingDraftUtterance }
  | { type: "set-identifiers"; identifiers: MeetingSessionIdentifiers | null }
  | { type: "set-status"; status: MeetingSessionStatus }
  | { type: "set-terminal-error"; error: MeetingSessionError | null }
  | { type: "upsert-note-chunk"; noteChunk: MeetingNoteChunk }

const BLOCKED_TRANSCRIPT_STATUSES: MeetingSessionStatus[] = [
  "completed",
  "failed",
  "interrupted",
  "stopped",
]

const BLOCKED_NOTE_STATUSES: MeetingSessionStatus[] = ["failed", "stopped"]

const normalizeText = (value: string): string => {
  return value.replace(/\s+/g, " ").trim()
}

const normalizeOptionalText = (value: string | null): string | null => {
  if (!value) {
    return null
  }

  const normalizedValue = normalizeText(value)

  return normalizedValue.length > 0 ? normalizedValue : null
}

const normalizeTranscriptMessages = (
  messages: MeetingSocketTranscriptMessage[],
): MeetingTranscriptMessage[] => {
  return messages.reduce<MeetingTranscriptMessage[]>((accumulator, message) => {
    const normalizedText = normalizeText(message.text)

    if (!normalizedText) {
      return accumulator
    }

    accumulator.push({
      speakerIndex:
        typeof message.speaker_index === "number" &&
        Number.isFinite(message.speaker_index)
          ? message.speaker_index
          : null,
      speakerLabel: normalizeOptionalText(message.speaker_label),
      text: normalizedText,
    })

    return accumulator
  }, [])
}

const buildCombinedTranscriptText = (
  messages: MeetingTranscriptMessage[],
): string => {
  return messages.map((message) => message.text).join(" ").trim()
}

const normalizeTextList = (values: string[]): string[] => {
  return values.map(normalizeText).filter((value) => value.length > 0)
}

const normalizeActionItems = (
  actionItems: MeetingNoteCreatedPayload["action_items"],
): MeetingNoteActionItem[] => {
  return actionItems.reduce<MeetingNoteActionItem[]>((accumulator, actionItem) => {
    const text = normalizeText(actionItem.text)

    if (!text) {
      return accumulator
    }

    accumulator.push({
      text,
      ownerText: normalizeOptionalText(actionItem.owner_text),
      dueText: normalizeOptionalText(actionItem.due_text),
    })

    return accumulator
  }, [])
}

const buildAcceptedSessionConfig = (
  payload: MeetingStartedPayload,
): MeetingAcceptedSessionConfig => {
  return {
    meetingId: payload.meeting_id,
    language: payload.language,
    encoding: payload.encoding,
    sampleRate: payload.sample_rate,
    channels: payload.channels,
  }
}

const buildSessionIdentifiers = (
  payload: MeetingStartedPayload,
): MeetingSessionIdentifiers => {
  return {
    organizationId: payload.organization_id,
    streamId: payload.stream_id,
    meetingId: payload.meeting_id,
  }
}

const buildDraftUtterance = (payload: MeetingFinalPayload): MeetingDraftUtterance => {
  const messages = normalizeTranscriptMessages(payload.messages)

  return {
    utteranceId: payload.utterance_id,
    meetingId: payload.meeting_id,
    streamId: payload.stream_id,
    messages,
    combinedText: buildCombinedTranscriptText(messages),
    lastUpdatedAt: new Date().toISOString(),
  }
}

const buildClosedUtterance = (
  payload: MeetingUtteranceClosedPayload,
): MeetingClosedUtterance => {
  const messages = normalizeTranscriptMessages(payload.messages)

  return {
    meetingId: payload.meeting_id,
    streamId: payload.stream_id,
    utteranceId: payload.utterance_id,
    sequence: payload.sequence,
    messages,
    combinedText: buildCombinedTranscriptText(messages),
    createdAt: payload.created_at,
  }
}

const buildNoteChunk = (payload: MeetingNoteCreatedPayload): MeetingNoteChunk => {
  return {
    id: payload.id,
    meetingId: payload.meeting_id,
    fromSequence: payload.from_sequence,
    toSequence: payload.to_sequence,
    keyPoints: normalizeTextList(payload.key_points),
    decisions: normalizeTextList(payload.decisions),
    actionItems: normalizeActionItems(payload.action_items),
    createdAt: payload.created_at,
  }
}

const buildSessionError = (payload: MeetingErrorPayload): MeetingSessionError => {
  return {
    code: payload.error_code,
    message: payload.error_message,
    retryable: payload.retryable,
    source: "runtime",
    timestamp: Date.now(),
  }
}

const shouldIgnoreTranscriptEvent = (status: MeetingSessionStatus): boolean => {
  return BLOCKED_TRANSCRIPT_STATUSES.includes(status)
}

const shouldIgnoreNoteEvent = (status: MeetingSessionStatus): boolean => {
  return BLOCKED_NOTE_STATUSES.includes(status)
}

const hasCommittedUtterance = (
  utterances: MeetingClosedUtterance[],
  utteranceId: string,
): boolean => {
  return utterances.some((utterance) => utterance.utteranceId === utteranceId)
}

const buildMeetingIdPatchAction = (
  state: MeetingReducerState,
  meetingId: string,
): MeetingSessionStoreAction | null => {
  if (!state.identifiers || state.identifiers.meetingId === meetingId) {
    return null
  }

  return {
    type: "patch-identifiers",
    value: {
      meetingId,
    },
  }
}

export const reduceMeetingEvent = (
  state: MeetingReducerState,
  event: MeetingReducerEvent,
): MeetingSessionStoreAction[] => {
  switch (event.name) {
    case "meeting:started":
      return [
        {
          type: "set-identifiers",
          identifiers: buildSessionIdentifiers(event.payload),
        },
        {
          type: "set-accepted-config",
          acceptedConfig: buildAcceptedSessionConfig(event.payload),
        },
        {
          type: "set-terminal-error",
          error: null,
        },
        {
          type: "set-status",
          status: event.payload.status,
        },
      ]

    case "meeting:final":
      if (
        shouldIgnoreTranscriptEvent(state.status) ||
        hasCommittedUtterance(state.committedUtterances, event.payload.utterance_id)
      ) {
        return [{ type: "noop" }]
      }

      return [
        {
          type: "set-draft-utterance",
          utterance: buildDraftUtterance(event.payload),
        },
      ]

    case "meeting:utterance_closed":
      if (shouldIgnoreTranscriptEvent(state.status)) {
        return [{ type: "noop" }]
      }

      return [
        {
          type: "append-committed-utterance",
          utterance: buildClosedUtterance(event.payload),
        },
      ]

    case "meeting:note:created":
      if (shouldIgnoreNoteEvent(state.status)) {
        return [{ type: "noop" }]
      }

      return [
        {
          type: "upsert-note-chunk",
          noteChunk: buildNoteChunk(event.payload),
        },
      ]

    case "meeting:completed":
    case "meeting:interrupted": {
      if (state.status === "failed") {
        return [{ type: "noop" }]
      }

      const patchAction = buildMeetingIdPatchAction(state, event.payload.meeting_id)

      return [
        ...(patchAction ? [patchAction] : []),
        {
          type: "set-terminal-error",
          error: null,
        },
        {
          type: "set-status",
          status: event.payload.status,
        },
      ]
    }

    case "meeting:error": {
      if (state.status === "stopped") {
        return [{ type: "noop" }]
      }

      const patchAction =
        typeof event.payload.meeting_id === "string"
          ? buildMeetingIdPatchAction(state, event.payload.meeting_id)
          : null

      return [
        ...(patchAction ? [patchAction] : []),
        {
          type: "set-terminal-error",
          error: buildSessionError(event.payload),
        },
        {
          type: "set-status",
          status: "failed",
        },
      ]
    }

    default:
      return [{ type: "noop" }]
  }
}

export const applyMeetingSessionStoreActions = (
  store: Pick<
    MeetingSessionActions,
    | "appendCommittedUtterance"
    | "patchIdentifiers"
    | "setAcceptedConfig"
    | "setDraftUtterance"
    | "setIdentifiers"
    | "setStatus"
    | "setTerminalError"
    | "upsertNoteChunk"
  >,
  actions: MeetingSessionStoreAction[],
): void => {
  actions.forEach((action) => {
    switch (action.type) {
      case "append-committed-utterance":
        store.appendCommittedUtterance(action.utterance)
        return

      case "patch-identifiers":
        store.patchIdentifiers(action.value)
        return

      case "set-accepted-config":
        store.setAcceptedConfig(action.acceptedConfig)
        return

      case "set-draft-utterance":
        store.setDraftUtterance(action.utterance)
        return

      case "set-identifiers":
        store.setIdentifiers(action.identifiers)
        return

      case "set-status":
        store.setStatus(action.status)
        return

      case "set-terminal-error":
        store.setTerminalError(action.error)
        return

      case "upsert-note-chunk":
        store.upsertNoteChunk(action.noteChunk)
        return

      case "noop":
        return

      default:
        return
    }
  })
}

export type { MeetingReducerEvent, MeetingSessionStoreAction }
