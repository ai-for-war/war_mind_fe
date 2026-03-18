import type {
  InterviewAudioChannel,
  InterviewAudioChannelMap,
  InterviewAudioEncoding,
  InterviewAudioFrameMetadata,
  InterviewAudioLanguage,
} from "@/features/interview-lab/types/audio.types"
import type { InterviewSourceRole } from "@/features/interview-lab/types/transcript.types"

export interface InterviewSocketStartPayload {
  stream_id: string
  conversation_id: string
  language: InterviewAudioLanguage
  encoding: InterviewAudioEncoding
  sample_rate: number
  channels: number
  channel_map: InterviewAudioChannelMap
}

export interface InterviewSocketAudioPayload {
  metadata: InterviewAudioFrameMetadata
  payload: ArrayBuffer
}

export interface InterviewSocketFinalizePayload {
  stream_id: string
}

export interface InterviewSocketStopPayload {
  stream_id: string
}

export type InterviewSttStartedPayload = InterviewSocketStartPayload

export interface InterviewSttPartialPayload {
  stream_id: string
  conversation_id: string
  source: InterviewSourceRole
  channel: InterviewAudioChannel
  transcript: string
  is_final: false
}

export interface InterviewSttFinalPayload {
  stream_id: string
  conversation_id: string
  source: InterviewSourceRole
  channel: InterviewAudioChannel
  transcript: string
  is_final: true
  confidence: number | null
  start_ms: number | null
  end_ms: number | null
}

export interface InterviewSttUtteranceClosedPayload {
  conversation_id: string
  utterance_id: string
  source: InterviewSourceRole
  channel: InterviewAudioChannel
  text: string
  started_at: string
  ended_at: string
  turn_closed_at: string
}

export interface InterviewSttCompletedPayload {
  stream_id: string
  conversation_id: string
  status: "completed"
}

export interface InterviewSttErrorPayload {
  stream_id?: string
  conversation_id?: string
  error_code: string
  error_message: string
  retryable: boolean
}

export interface InterviewAnswerStartedPayload {
  conversation_id: string
  utterance_id: string
}

export interface InterviewAnswerTokenPayload {
  conversation_id: string
  utterance_id: string
  token: string
}

export interface InterviewAnswerCompletedPayload {
  conversation_id: string
  utterance_id: string
  text: string
}

export interface InterviewAnswerFailedPayload {
  conversation_id: string
  utterance_id: string
  error: string
}

export type InterviewAnswerAliasPayload = InterviewAnswerCompletedPayload

export type InterviewSocketInboundEventPayload =
  | InterviewSttStartedPayload
  | InterviewSttPartialPayload
  | InterviewSttFinalPayload
  | InterviewSttUtteranceClosedPayload
  | InterviewSttCompletedPayload
  | InterviewSttErrorPayload
  | InterviewAnswerStartedPayload
  | InterviewAnswerTokenPayload
  | InterviewAnswerCompletedPayload
  | InterviewAnswerAliasPayload
  | InterviewAnswerFailedPayload
