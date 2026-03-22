import type {
  MeetingAudioEncoding,
  MeetingAudioFrameMetadata,
  MeetingAudioLanguage,
} from "@/features/meeting-recorder/types/audio.types"

export interface MeetingSocketScopedPayload {
  organization_id?: unknown
  stream_id?: unknown
  meeting_id?: unknown
}

export interface MeetingSocketTranscriptMessage {
  speaker_index: number
  speaker_label: string | null
  text: string
}

export interface MeetingSocketNoteActionItem {
  text: string
  owner_text: string | null
  due_text: string | null
}

export interface MeetingSocketStartPayload {
  organization_id: string
  stream_id: string
  title?: string
  language: MeetingAudioLanguage
  encoding: MeetingAudioEncoding
  sample_rate: number
  channels: number
}

export interface MeetingSocketAudioPayload {
  metadata: MeetingAudioFrameMetadata
  payload: ArrayBuffer
}

export interface MeetingSocketFinalizePayload {
  stream_id: string
}

export interface MeetingSocketStopPayload {
  stream_id: string
}

export interface MeetingStartedPayload {
  organization_id: string
  stream_id: string
  meeting_id: string
  language: MeetingAudioLanguage
  encoding: MeetingAudioEncoding
  sample_rate: number
  channels: number
  status: "streaming"
}

export interface MeetingFinalPayload {
  organization_id: string
  stream_id: string
  meeting_id: string
  utterance_id: string
  messages: MeetingSocketTranscriptMessage[]
  is_final: true
}

export interface MeetingUtteranceClosedPayload {
  organization_id: string
  stream_id: string
  meeting_id: string
  utterance_id: string
  sequence: number
  messages: MeetingSocketTranscriptMessage[]
  created_at: string
}

export interface MeetingNoteCreatedPayload {
  organization_id: string
  id: string
  meeting_id: string
  from_sequence: number
  to_sequence: number
  key_points: string[]
  decisions: string[]
  action_items: MeetingSocketNoteActionItem[]
  created_at: string
}

export interface MeetingCompletedPayload {
  organization_id: string
  stream_id: string
  meeting_id: string
  status: "completed"
}

export interface MeetingInterruptedPayload {
  organization_id: string
  stream_id: string
  meeting_id: string
  status: "interrupted"
}

export interface MeetingErrorPayload {
  organization_id: string
  stream_id?: string
  meeting_id?: string
  error_code: string
  error_message: string
  retryable: boolean
}

export type MeetingSocketInboundEventPayload =
  | MeetingStartedPayload
  | MeetingFinalPayload
  | MeetingUtteranceClosedPayload
  | MeetingNoteCreatedPayload
  | MeetingCompletedPayload
  | MeetingInterruptedPayload
  | MeetingErrorPayload
