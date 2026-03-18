import { INTERVIEW_SESSION_STATUSES, INTERVIEW_SESSION_TERMINAL_REASONS } from "@/features/interview-lab/constants"
import type {
  InterviewAudioChannelMap,
  InterviewAudioEncoding,
  InterviewAudioLanguage,
} from "@/features/interview-lab/types/audio.types"
import type {
  InterviewAiAnswerState,
  InterviewClosedUtterance,
  InterviewOpenUtterance,
  InterviewSourceReadinessState,
  InterviewSourceRole,
} from "@/features/interview-lab/types/transcript.types"

export type InterviewSessionStatus = (typeof INTERVIEW_SESSION_STATUSES)[number]

export type InterviewSessionTerminalReason =
  (typeof INTERVIEW_SESSION_TERMINAL_REASONS)[number]

export interface InterviewSessionIdentifiers {
  conversationId: string
  streamId: string
}

export interface InterviewSessionError {
  code: string
  message: string
  retryable: boolean
  source: "socket" | "microphone" | "interviewer_tab" | "runtime" | "ai_answer" | "unknown"
  timestamp: number
}

export interface InterviewAcceptedSessionConfig {
  language: InterviewAudioLanguage
  encoding: InterviewAudioEncoding
  sampleRate: number
  channels: number
  channelMap: InterviewAudioChannelMap
}

export interface InterviewSessionState {
  identifiers: InterviewSessionIdentifiers | null
  status: InterviewSessionStatus
  terminalReason: InterviewSessionTerminalReason | null
  sourceReadiness: Record<InterviewSourceRole, InterviewSourceReadinessState>
  openUtterances: Record<InterviewSourceRole, InterviewOpenUtterance | null>
  closedUtterances: InterviewClosedUtterance[]
  aiAnswers: Record<string, InterviewAiAnswerState>
  error: InterviewSessionError | null
  acceptedConfig: InterviewAcceptedSessionConfig | null
  lastEventAt: string | null
}

