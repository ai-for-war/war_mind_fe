import {
  INTERVIEW_AI_ANSWER_STATUSES,
  INTERVIEW_SOURCE_READINESS_STATUSES,
  INTERVIEW_SOURCE_ROLES,
} from "@/features/interview-lab/constants"
import type { InterviewAudioChannel } from "@/features/interview-lab/types/audio.types"

export type InterviewSourceRole = (typeof INTERVIEW_SOURCE_ROLES)[number]

export type InterviewSourceReadinessStatus =
  (typeof INTERVIEW_SOURCE_READINESS_STATUSES)[number]

export type InterviewAiAnswerStatus = (typeof INTERVIEW_AI_ANSWER_STATUSES)[number]

export interface InterviewSourceReadinessState {
  role: InterviewSourceRole
  status: InterviewSourceReadinessStatus
  isReady: boolean
  error: string | null
  updatedAt: string | null
}

export interface InterviewStableTranscriptFragment {
  transcript: string
  confidence: number | null
  startMs: number | null
  endMs: number | null
  receivedAt: string
}

export interface InterviewOpenUtterance {
  source: InterviewSourceRole
  channel: InterviewAudioChannel
  previewText: string
  stableText: string
  combinedText: string
  stableFragments: InterviewStableTranscriptFragment[]
  lastUpdatedAt: string
}

export interface InterviewClosedUtterance {
  conversationId: string
  utteranceId: string
  source: InterviewSourceRole
  channel: InterviewAudioChannel
  text: string
  startedAt: string
  endedAt: string
  turnClosedAt: string
}

export interface InterviewAiAnswerState {
  conversationId: string
  utteranceId: string
  status: InterviewAiAnswerStatus
  text: string
  tokens: string[]
  startedAt: string | null
  completedAt: string | null
  error: string | null
  updatedAt: string
}

