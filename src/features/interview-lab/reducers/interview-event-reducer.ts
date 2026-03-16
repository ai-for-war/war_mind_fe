import type { InterviewSessionActions } from "@/features/interview-lab/stores"
import type {
  InterviewAcceptedSessionConfig,
  InterviewAiAnswerState,
  InterviewClosedUtterance,
  InterviewOpenUtterance,
  InterviewSessionError,
  InterviewSessionIdentifiers,
  InterviewSessionState,
  InterviewSessionStatus,
  InterviewSessionTerminalReason,
  InterviewStableTranscriptFragment,
  InterviewSttCompletedPayload,
  InterviewSttErrorPayload,
  InterviewSttFinalPayload,
  InterviewSttPartialPayload,
  InterviewSttStartedPayload,
  InterviewSttUtteranceClosedPayload,
  InterviewAnswerAliasPayload,
  InterviewAnswerCompletedPayload,
  InterviewAnswerFailedPayload,
  InterviewAnswerStartedPayload,
  InterviewAnswerTokenPayload,
  InterviewSourceRole,
} from "@/features/interview-lab/types"
import { isDuplicateInterviewFinalAnswerEvent } from "@/features/interview-lab/utils"

type InterviewReducerState = Pick<
  InterviewSessionState,
  "aiAnswers" | "openUtterances"
>

type InterviewReducerEvent =
  | { name: "stt:started"; payload: InterviewSttStartedPayload }
  | { name: "stt:partial"; payload: InterviewSttPartialPayload }
  | { name: "stt:final"; payload: InterviewSttFinalPayload }
  | { name: "stt:utterance_closed"; payload: InterviewSttUtteranceClosedPayload }
  | { name: "stt:completed"; payload: InterviewSttCompletedPayload }
  | { name: "stt:error"; payload: InterviewSttErrorPayload }
  | { name: "interview:answer:started"; payload: InterviewAnswerStartedPayload }
  | { name: "interview:answer:token"; payload: InterviewAnswerTokenPayload }
  | { name: "interview:answer:completed"; payload: InterviewAnswerCompletedPayload }
  | { name: "interview:answer"; payload: InterviewAnswerAliasPayload }
  | { name: "interview:answer:failed"; payload: InterviewAnswerFailedPayload }

type InterviewSessionStoreAction =
  | { type: "append-closed-utterance"; utterance: InterviewClosedUtterance }
  | { type: "clear-open-utterance"; role: InterviewSourceRole }
  | { type: "noop" }
  | { type: "set-accepted-config"; acceptedConfig: InterviewAcceptedSessionConfig | null }
  | { type: "set-identifiers"; identifiers: InterviewSessionIdentifiers | null }
  | { type: "set-open-utterance"; role: InterviewSourceRole; utterance: InterviewOpenUtterance | null }
  | { type: "set-session-error"; error: InterviewSessionError | null }
  | { type: "set-status"; status: InterviewSessionStatus }
  | { type: "set-terminal-reason"; terminalReason: InterviewSessionTerminalReason | null }
  | { type: "upsert-ai-answer"; answer: InterviewAiAnswerState }

const buildAcceptedSessionConfig = (
  payload: InterviewSttStartedPayload,
): InterviewAcceptedSessionConfig => {
  return {
    language: payload.language,
    encoding: payload.encoding,
    sampleRate: payload.sample_rate,
    channels: payload.channels,
    channelMap: payload.channel_map,
  }
}

const buildSessionIdentifiers = (
  payload: InterviewSttStartedPayload,
): InterviewSessionIdentifiers => {
  return {
    conversationId: payload.conversation_id,
    streamId: payload.stream_id,
  }
}

const normalizeTranscriptText = (value: string): string => {
  return value.replace(/\s+/g, " ").trim()
}

const findOverlapLength = (left: string, right: string): number => {
  const maxOverlapLength = Math.min(left.length, right.length)

  for (let currentLength = maxOverlapLength; currentLength > 0; currentLength -= 1) {
    if (left.slice(-currentLength) === right.slice(0, currentLength)) {
      return currentLength
    }
  }

  return 0
}

const mergeTranscriptText = (existingText: string, nextText: string): string => {
  const normalizedExistingText = normalizeTranscriptText(existingText)
  const normalizedNextText = normalizeTranscriptText(nextText)

  if (!normalizedExistingText) {
    return normalizedNextText
  }

  if (!normalizedNextText) {
    return normalizedExistingText
  }

  if (normalizedExistingText === normalizedNextText) {
    return normalizedExistingText
  }

  if (normalizedNextText.startsWith(normalizedExistingText)) {
    return normalizedNextText
  }

  if (normalizedExistingText.endsWith(normalizedNextText)) {
    return normalizedExistingText
  }

  const overlapLength = findOverlapLength(normalizedExistingText, normalizedNextText)

  if (overlapLength > 0) {
    return `${normalizedExistingText}${normalizedNextText.slice(overlapLength)}`
  }

  return `${normalizedExistingText} ${normalizedNextText}`.trim()
}

const derivePreviewText = (stableText: string, combinedText: string): string => {
  if (!combinedText) {
    return ""
  }

  if (!stableText) {
    return combinedText
  }

  if (combinedText === stableText) {
    return ""
  }

  if (combinedText.startsWith(stableText)) {
    return combinedText.slice(stableText.length).trimStart()
  }

  return combinedText
}

const appendStableFragment = (
  stableFragments: InterviewStableTranscriptFragment[],
  payload: InterviewSttFinalPayload,
): InterviewStableTranscriptFragment[] => {
  const nextFragment: InterviewStableTranscriptFragment = {
    transcript: normalizeTranscriptText(payload.transcript),
    confidence: payload.confidence,
    startMs: payload.start_ms,
    endMs: payload.end_ms,
    receivedAt: new Date().toISOString(),
  }

  const hasDuplicateFragment = stableFragments.some((currentFragment) => {
    return (
      currentFragment.transcript === nextFragment.transcript &&
      currentFragment.startMs === nextFragment.startMs &&
      currentFragment.endMs === nextFragment.endMs
    )
  })

  if (hasDuplicateFragment) {
    return stableFragments
  }

  return [...stableFragments, nextFragment]
}

const buildOpenUtteranceFromPartial = (
  existingUtterance: InterviewOpenUtterance | null | undefined,
  payload: InterviewSttPartialPayload,
): InterviewOpenUtterance => {
  const stableText = existingUtterance?.stableText ?? ""
  const combinedText = normalizeTranscriptText(payload.transcript)

  return {
    source: payload.source,
    channel: payload.channel,
    stableText,
    previewText: derivePreviewText(stableText, combinedText),
    combinedText,
    stableFragments: existingUtterance?.stableFragments ?? [],
    lastUpdatedAt: new Date().toISOString(),
  }
}

const buildOpenUtteranceFromFinal = (
  existingUtterance: InterviewOpenUtterance | null | undefined,
  payload: InterviewSttFinalPayload,
): InterviewOpenUtterance => {
  const stableFragments = appendStableFragment(
    existingUtterance?.stableFragments ?? [],
    payload,
  )
  const stableText = mergeTranscriptText(
    existingUtterance?.stableText ?? "",
    payload.transcript,
  )
  const existingPreviewText = derivePreviewText(
    existingUtterance?.stableText ?? "",
    existingUtterance?.combinedText ?? "",
  )
  const combinedText = mergeTranscriptText(stableText, existingPreviewText)

  return {
    source: payload.source,
    channel: payload.channel,
    stableText,
    previewText: derivePreviewText(stableText, combinedText),
    combinedText,
    stableFragments,
    lastUpdatedAt: new Date().toISOString(),
  }
}

const buildClosedUtterance = (
  payload: InterviewSttUtteranceClosedPayload,
): InterviewClosedUtterance => {
  return {
    conversationId: payload.conversation_id,
    utteranceId: payload.utterance_id,
    source: payload.source,
    channel: payload.channel,
    text: normalizeTranscriptText(payload.text),
    startedAt: payload.started_at,
    endedAt: payload.ended_at,
    turnClosedAt: payload.turn_closed_at,
  }
}

const buildSessionError = (payload: InterviewSttErrorPayload): InterviewSessionError => {
  return {
    code: payload.error_code,
    message: payload.error_message,
    retryable: payload.retryable,
    source: "runtime",
    timestamp: Date.now(),
  }
}

const buildStreamingAnswer = (
  existingAnswer: InterviewAiAnswerState | null | undefined,
  payload: InterviewAnswerStartedPayload | InterviewAnswerTokenPayload,
): InterviewAiAnswerState => {
  const nextToken =
    "token" in payload ? payload.token : ""
  const nextText = "token" in payload
    ? `${existingAnswer?.text ?? ""}${payload.token}`
    : existingAnswer?.text ?? ""
  const nextTokens = "token" in payload
    ? [...(existingAnswer?.tokens ?? []), payload.token]
    : existingAnswer?.tokens ?? []
  const updatedAt = new Date().toISOString()

  return {
    conversationId: payload.conversation_id,
    utteranceId: payload.utterance_id,
    status: "streaming",
    text: nextToken ? nextText : existingAnswer?.text ?? "",
    tokens: nextTokens,
    startedAt: existingAnswer?.startedAt ?? updatedAt,
    completedAt: null,
    error: null,
    updatedAt,
  }
}

const buildCompletedAnswer = (
  existingAnswer: InterviewAiAnswerState | null | undefined,
  payload: InterviewAnswerCompletedPayload | InterviewAnswerAliasPayload,
): InterviewAiAnswerState => {
  const updatedAt = new Date().toISOString()

  return {
    conversationId: payload.conversation_id,
    utteranceId: payload.utterance_id,
    status: "completed",
    text: payload.text,
    tokens: existingAnswer?.tokens ?? [],
    startedAt: existingAnswer?.startedAt ?? updatedAt,
    completedAt: updatedAt,
    error: null,
    updatedAt,
  }
}

const buildFailedAnswer = (
  existingAnswer: InterviewAiAnswerState | null | undefined,
  payload: InterviewAnswerFailedPayload,
): InterviewAiAnswerState => {
  const updatedAt = new Date().toISOString()

  return {
    conversationId: payload.conversation_id,
    utteranceId: payload.utterance_id,
    status: "failed",
    text: existingAnswer?.text ?? "",
    tokens: existingAnswer?.tokens ?? [],
    startedAt: existingAnswer?.startedAt ?? updatedAt,
    completedAt: existingAnswer?.completedAt ?? null,
    error: payload.error,
    updatedAt,
  }
}

export const reduceInterviewEvent = (
  state: InterviewReducerState,
  event: InterviewReducerEvent,
): InterviewSessionStoreAction[] => {
  switch (event.name) {
    case "stt:started":
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
          type: "set-session-error",
          error: null,
        },
        {
          type: "set-terminal-reason",
          terminalReason: null,
        },
        {
          type: "set-status",
          status: "streaming",
        },
      ]

    case "stt:partial":
      return [
        {
          type: "set-open-utterance",
          role: event.payload.source,
          utterance: buildOpenUtteranceFromPartial(
            state.openUtterances[event.payload.source],
            event.payload,
          ),
        },
      ]

    case "stt:final":
      return [
        {
          type: "set-open-utterance",
          role: event.payload.source,
          utterance: buildOpenUtteranceFromFinal(
            state.openUtterances[event.payload.source],
            event.payload,
          ),
        },
      ]

    case "stt:utterance_closed":
      return [
        {
          type: "append-closed-utterance",
          utterance: buildClosedUtterance(event.payload),
        },
        {
          type: "clear-open-utterance",
          role: event.payload.source,
        },
      ]

    case "stt:completed":
      return [
        {
          type: "set-session-error",
          error: null,
        },
        {
          type: "set-terminal-reason",
          terminalReason: "completed",
        },
        {
          type: "set-status",
          status: event.payload.status,
        },
      ]

    case "stt:error":
      return [
        {
          type: "set-session-error",
          error: buildSessionError(event.payload),
        },
        {
          type: "set-terminal-reason",
          terminalReason: "runtime_failure",
        },
        {
          type: "set-status",
          status: "failed",
        },
      ]

    case "interview:answer:started": {
      const existingAnswer = state.aiAnswers[event.payload.utterance_id]

      if (existingAnswer?.status === "completed") {
        return [{ type: "noop" }]
      }

      return [
        {
          type: "upsert-ai-answer",
          answer: buildStreamingAnswer(existingAnswer, event.payload),
        },
      ]
    }

    case "interview:answer:token": {
      const existingAnswer = state.aiAnswers[event.payload.utterance_id]

      if (existingAnswer?.status === "completed") {
        return [{ type: "noop" }]
      }

      return [
        {
          type: "upsert-ai-answer",
          answer: buildStreamingAnswer(existingAnswer, event.payload),
        },
      ]
    }

    case "interview:answer:completed":
    case "interview:answer": {
      const existingAnswer = state.aiAnswers[event.payload.utterance_id]

      if (isDuplicateInterviewFinalAnswerEvent(existingAnswer, event.payload)) {
        return [{ type: "noop" }]
      }

      return [
        {
          type: "upsert-ai-answer",
          answer: buildCompletedAnswer(existingAnswer, event.payload),
        },
      ]
    }

    case "interview:answer:failed": {
      const existingAnswer = state.aiAnswers[event.payload.utterance_id]

      if (existingAnswer?.status === "completed") {
        return [{ type: "noop" }]
      }

      return [
        {
          type: "upsert-ai-answer",
          answer: buildFailedAnswer(existingAnswer, event.payload),
        },
      ]
    }

    default:
      return [{ type: "noop" }]
  }
}

export const applyInterviewSessionStoreActions = (
  store: Pick<
    InterviewSessionActions,
    | "appendClosedUtterance"
    | "clearOpenUtterance"
    | "setAcceptedConfig"
    | "setIdentifiers"
    | "setOpenUtterance"
    | "setSessionError"
    | "setStatus"
    | "setTerminalReason"
    | "upsertAiAnswer"
  >,
  actions: InterviewSessionStoreAction[],
): void => {
  actions.forEach((action) => {
    switch (action.type) {
      case "append-closed-utterance":
        store.appendClosedUtterance(action.utterance)
        return

      case "clear-open-utterance":
        store.clearOpenUtterance(action.role)
        return

      case "set-accepted-config":
        store.setAcceptedConfig(action.acceptedConfig)
        return

      case "set-identifiers":
        store.setIdentifiers(action.identifiers)
        return

      case "set-open-utterance":
        store.setOpenUtterance(action.role, action.utterance)
        return

      case "set-session-error":
        store.setSessionError(action.error)
        return

      case "set-status":
        store.setStatus(action.status)
        return

      case "set-terminal-reason":
        store.setTerminalReason(action.terminalReason)
        return

      case "upsert-ai-answer":
        store.upsertAiAnswer(action.answer)
        return

      case "noop":
        return

      default:
        return
    }
  })
}

export type { InterviewReducerEvent, InterviewSessionStoreAction }
