import { Mic, Share2 } from "lucide-react"

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

export const INTERVIEW_LANGUAGE_OPTIONS = [
  { label: "Belarusian", value: "be" },
  { label: "Bengali", value: "bn" },
  { label: "Bosnian", value: "bs" },
  { label: "Bulgarian", value: "bg" },
  { label: "Catalan", value: "ca" },
  { label: "Chinese (Cantonese, Traditional)", value: "zh-HK" },
  { label: "Croatian", value: "hr" },
  { label: "Czech", value: "cs" },
  { label: "Danish", value: "da" },
  { label: "Danish (Denmark)", value: "da-DK" },
  { label: "Dutch", value: "nl" },
  { label: "English", value: "en" },
  { label: "English (US)", value: "en-US" },
  { label: "English (Australia)", value: "en-AU" },
  { label: "English (UK)", value: "en-GB" },
  { label: "English (India)", value: "en-IN" },
  { label: "English (New Zealand)", value: "en-NZ" },
  { label: "Estonian", value: "et" },
  { label: "Finnish", value: "fi" },
  { label: "Flemish", value: "nl-BE" },
  { label: "French", value: "fr" },
  { label: "French (Canada)", value: "fr-CA" },
  { label: "German", value: "de" },
  { label: "German (Switzerland)", value: "de-CH" },
  { label: "Greek", value: "el" },
  { label: "Hebrew", value: "he" },
  { label: "Hindi", value: "hi" },
  { label: "Hungarian", value: "hu" },
  { label: "Indonesian", value: "id" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Kannada", value: "kn" },
  { label: "Korean", value: "ko" },
  { label: "Korean (South Korea)", value: "ko-KR" },
  { label: "Latvian", value: "lv" },
  { label: "Lithuanian", value: "lt" },
  { label: "Macedonian", value: "mk" },
  { label: "Malay", value: "ms" },
  { label: "Marathi", value: "mr" },
  { label: "Norwegian", value: "no" },
  { label: "Persian", value: "fa" },
  { label: "Polish", value: "pl" },
  { label: "Portuguese", value: "pt" },
  { label: "Portuguese (Brazil)", value: "pt-BR" },
  { label: "Portuguese (Portugal)", value: "pt-PT" },
  { label: "Romanian", value: "ro" },
  { label: "Russian", value: "ru" },
  { label: "Serbian", value: "sr" },
  { label: "Slovak", value: "sk" },
  { label: "Slovenian", value: "sl" },
  { label: "Spanish", value: "es" },
  { label: "Spanish (Latin America)", value: "es-419" },
  { label: "Swedish", value: "sv" },
  { label: "Swedish (Sweden)", value: "sv-SE" },
  { label: "Tagalog", value: "tl" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
  { label: "Thai", value: "th" },
  { label: "Thai (Thailand)", value: "th-TH" },
  { label: "Turkish", value: "tr" },
  { label: "Ukrainian", value: "uk" },
  { label: "Urdu", value: "ur" },
  { label: "Vietnamese", value: "vi" },
] as const

export const INTERVIEW_DEFAULT_LANGUAGE = "vi" as const

export const INTERVIEW_AUDIO_METADATA_DEFAULTS = {
  language: INTERVIEW_DEFAULT_LANGUAGE,
  encoding: "linear16",
  sampleRate: 16000,
  channels: 2,
  frameDurationMs: 100,
} as const

export const INTERVIEW_CONVERSATION_ID_PREFIX = "interview"
export const INTERVIEW_STREAM_ID_PREFIX = "stream"

export const READINESS_ITEM_METADATA = {
  interviewer: {
    description: "Meet tab audio",
    icon: Share2,
    title: "Interviewer lane",
  },
  user: {
    description: "Microphone input",
    icon: Mic,
    title: "User lane",
  },
} as const

export const STATUS_LABELS = {
  completed: "Completed",
  failed: "Failed",
  finalizing: "Finalizing",
  idle: "Idle",
  media_ready: "Media Ready",
  preparing_media: "Preparing Media",
  starting: "Starting",
  stopped: "Stopped",
  stopping: "Stopping",
  streaming: "Streaming",
} as const

export const READINESS_LABELS = {
  ended: "Ended",
  failed: "Failed",
  idle: "Idle",
  ready: "Ready",
  requesting: "Requesting",
} as const
