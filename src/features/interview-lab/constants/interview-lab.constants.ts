export const INTERVIEW_SESSION_STATUSES = [
  "idle",
  "preparing_media",
  "media_ready",
  "starting",
  "streaming",
  "finalizing",
  "completed",
  "stopping",
  "stopped",
  "failed",
] as const

export const INTERVIEW_SESSION_TERMINAL_REASONS = [
  "completed",
  "user_stop",
  "runtime_failure",
] as const

export const INTERVIEW_SOURCE_ROLES = ["interviewer", "user"] as const

export const INTERVIEW_SOURCE_READINESS_STATUSES = [
  "idle",
  "requesting",
  "ready",
  "failed",
  "ended",
] as const

export const INTERVIEW_AI_ANSWER_STATUSES = [
  "idle",
  "streaming",
  "completed",
  "failed",
] as const

export const INTERVIEW_AUDIO_CHANNELS = [0, 1] as const

export const INTERVIEW_CHANNEL_MAP = {
  0: "interviewer",
  1: "user",
} as const

export const INTERVIEW_AUDIO_METADATA_DEFAULTS = {
  language: "en",
  encoding: "linear16",
  sampleRate: 16000,
  channels: 2,
  frameDurationMs: 100,
} as const

export const INTERVIEW_CONVERSATION_ID_PREFIX = "interview"
export const INTERVIEW_STREAM_ID_PREFIX = "stream"

