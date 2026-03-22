import {
  INTERVIEW_DEFAULT_LANGUAGE,
  INTERVIEW_LANGUAGE_OPTIONS,
} from "@/features/interview-lab/constants"

export const MEETING_SESSION_STATUSES = [
  "idle",
  "preparing_media",
  "media_ready",
  "starting",
  "streaming",
  "finalizing",
  "completed",
  "interrupted",
  "stopped",
  "failed",
] as const

export const MEETING_SOURCE_ROLES = ["meeting_tab", "microphone"] as const

export const MEETING_SOURCE_READINESS_STATUSES = [
  "idle",
  "requesting",
  "ready",
  "failed",
  "ended",
] as const

export const MEETING_LANGUAGE_OPTIONS = INTERVIEW_LANGUAGE_OPTIONS

export const MEETING_DEFAULT_LANGUAGE = INTERVIEW_DEFAULT_LANGUAGE

export const MEETING_AUDIO_METADATA_DEFAULTS = {
  language: MEETING_DEFAULT_LANGUAGE,
  encoding: "linear16",
  sampleRate: 16000,
  channels: 1,
  frameDurationMs: 100,
} as const

export const MEETING_STREAM_ID_PREFIX = "meeting_stream"

export const MEETING_STATUS_LABELS = {
  completed: "Completed",
  failed: "Failed",
  finalizing: "Finalizing",
  idle: "Idle",
  interrupted: "Interrupted",
  media_ready: "Media Ready",
  preparing_media: "Preparing Media",
  starting: "Starting",
  stopped: "Stopped",
  streaming: "Streaming",
} as const

export const MEETING_SOURCE_READINESS_LABELS = {
  ended: "Ended",
  failed: "Failed",
  idle: "Idle",
  ready: "Ready",
  requesting: "Requesting",
} as const
