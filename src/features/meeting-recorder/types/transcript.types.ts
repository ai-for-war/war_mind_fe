import {
  MEETING_SOURCE_READINESS_STATUSES,
  MEETING_SOURCE_ROLES,
} from "@/features/meeting-recorder/constants"

export type MeetingSourceRole = (typeof MEETING_SOURCE_ROLES)[number]

export type MeetingSourceReadinessStatus =
  (typeof MEETING_SOURCE_READINESS_STATUSES)[number]

export interface MeetingSourceReadinessState {
  role: MeetingSourceRole
  status: MeetingSourceReadinessStatus
  isReady: boolean
  error: string | null
  updatedAt: string | null
}

export interface MeetingTranscriptMessage {
  speakerIndex: number | null
  speakerLabel: string | null
  text: string
}

export interface MeetingDraftUtterance {
  utteranceId: string
  meetingId: string
  streamId: string
  messages: MeetingTranscriptMessage[]
  combinedText: string
  lastUpdatedAt: string
}

export interface MeetingClosedUtterance {
  meetingId: string
  streamId: string
  utteranceId: string
  sequence: number
  messages: MeetingTranscriptMessage[]
  combinedText: string
  createdAt: string
}
