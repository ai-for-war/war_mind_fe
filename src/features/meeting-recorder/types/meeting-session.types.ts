import { MEETING_SESSION_STATUSES } from "@/features/meeting-recorder/constants"
import type {
  MeetingAudioEncoding,
  MeetingAudioLanguage,
} from "@/features/meeting-recorder/types/audio.types"
import type {
  MeetingDerivedNotesState,
  MeetingNoteChunk,
} from "@/features/meeting-recorder/types/meeting-note.types"
import type {
  MeetingClosedUtterance,
  MeetingDraftUtterance,
  MeetingSourceReadinessState,
  MeetingSourceRole,
} from "@/features/meeting-recorder/types/transcript.types"

export type MeetingSessionStatus = (typeof MEETING_SESSION_STATUSES)[number]

export interface MeetingSessionIdentifiers {
  organizationId: string
  streamId: string
  meetingId: string | null
}

export interface MeetingSessionError {
  code: string
  message: string
  retryable: boolean
  source:
    | "socket"
    | "organization"
    | "meeting_tab"
    | "microphone"
    | "runtime"
    | "unknown"
  timestamp: number
}

export interface MeetingAcceptedSessionConfig {
  meetingId: string
  language: MeetingAudioLanguage
  encoding: MeetingAudioEncoding
  sampleRate: number
  channels: number
}

export interface MeetingSessionState {
  identifiers: MeetingSessionIdentifiers | null
  status: MeetingSessionStatus
  sourceReadiness: Record<MeetingSourceRole, MeetingSourceReadinessState>
  draftUtterances: Record<string, MeetingDraftUtterance>
  committedUtterances: MeetingClosedUtterance[]
  noteChunks: MeetingNoteChunk[]
  derivedNotes: MeetingDerivedNotesState
  terminalError: MeetingSessionError | null
  acceptedConfig: MeetingAcceptedSessionConfig | null
  lastEventAt: string | null
}
