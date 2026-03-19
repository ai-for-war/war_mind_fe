import {
  INTERVIEW_AUDIO_CHANNELS,
  INTERVIEW_AUDIO_METADATA_DEFAULTS,
  INTERVIEW_CHANNEL_MAP,
  INTERVIEW_LANGUAGE_OPTIONS,
  INTERVIEW_SOURCE_ROLES,
} from "@/features/interview-lab/constants"

export type InterviewAudioChannel = (typeof INTERVIEW_AUDIO_CHANNELS)[number]

export type InterviewAudioEncoding = typeof INTERVIEW_AUDIO_METADATA_DEFAULTS.encoding

export type InterviewAudioLanguage =
  (typeof INTERVIEW_LANGUAGE_OPTIONS)[number]["value"]

export type InterviewAudioChannelMap = typeof INTERVIEW_CHANNEL_MAP

export type InterviewAudioSourceRole = (typeof INTERVIEW_SOURCE_ROLES)[number]

export interface InterviewAudioFrameMetadata {
  stream_id: string
  conversation_id: string
  encoding: InterviewAudioEncoding
  sample_rate: typeof INTERVIEW_AUDIO_METADATA_DEFAULTS.sampleRate
  channels: typeof INTERVIEW_AUDIO_METADATA_DEFAULTS.channels
  sequence: number
  timestamp_ms: number
}

export interface InterviewAudioPipelineConfig {
  language: InterviewAudioLanguage
  encoding: InterviewAudioEncoding
  sampleRate: typeof INTERVIEW_AUDIO_METADATA_DEFAULTS.sampleRate
  channels: typeof INTERVIEW_AUDIO_METADATA_DEFAULTS.channels
  channelMap: InterviewAudioChannelMap
  frameDurationMs: typeof INTERVIEW_AUDIO_METADATA_DEFAULTS.frameDurationMs
}

export interface InterviewAudioFrame {
  metadata: InterviewAudioFrameMetadata
  payload: ArrayBuffer
}

export interface InterviewAudioSourceDescriptor {
  role: InterviewAudioSourceRole
  channel: InterviewAudioChannel
  kind: "tab" | "microphone"
}

export interface InterviewAudioLaneChunk {
  channel: InterviewAudioChannel
  samples: Int16Array
}
