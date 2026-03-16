import { nanoid } from "nanoid"

import {
  INTERVIEW_CONVERSATION_ID_PREFIX,
  INTERVIEW_STREAM_ID_PREFIX,
} from "@/features/interview-lab/constants"
import type {
  InterviewAiAnswerState,
  InterviewAnswerCompletedPayload,
  InterviewAnswerAliasPayload,
  InterviewSessionIdentifiers,
} from "@/features/interview-lab/types"

type SessionScopedPayload = {
  conversation_id?: unknown
  stream_id?: unknown
}

const buildInterviewIdentifier = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${nanoid(8)}`
}

const readOptionalString = (value: unknown): string | null => {
  return typeof value === "string" && value.length > 0 ? value : null
}

export const generateInterviewConversationId = (): string => {
  return buildInterviewIdentifier(INTERVIEW_CONVERSATION_ID_PREFIX)
}

export const generateInterviewStreamId = (): string => {
  return buildInterviewIdentifier(INTERVIEW_STREAM_ID_PREFIX)
}

export const guardInterviewInboundEvent = <TPayload extends SessionScopedPayload>(
  payload: TPayload,
  activeIdentifiers: InterviewSessionIdentifiers | null,
): boolean => {
  if (!activeIdentifiers) {
    return false
  }

  const conversationId = readOptionalString(payload.conversation_id)

  if (!conversationId || conversationId !== activeIdentifiers.conversationId) {
    return false
  }

  if ("stream_id" in payload) {
    const streamId = readOptionalString(payload.stream_id)

    if (!streamId || streamId !== activeIdentifiers.streamId) {
      return false
    }
  }

  return true
}

export const isDuplicateInterviewFinalAnswerEvent = (
  existingAnswer: InterviewAiAnswerState | null | undefined,
  payload: InterviewAnswerCompletedPayload | InterviewAnswerAliasPayload,
): boolean => {
  if (!existingAnswer) {
    return false
  }

  return (
    existingAnswer.utteranceId === payload.utterance_id &&
    existingAnswer.status === "completed" &&
    existingAnswer.text.trim() === payload.text.trim()
  )
}

