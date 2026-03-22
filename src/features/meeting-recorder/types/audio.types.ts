import {
  MEETING_AUDIO_METADATA_DEFAULTS,
  MEETING_LANGUAGE_OPTIONS,
} from "@/features/meeting-recorder/constants"
import type { MeetingSourceRole } from "@/features/meeting-recorder/types/transcript.types"

export type MeetingAudioEncoding = typeof MEETING_AUDIO_METADATA_DEFAULTS.encoding

export type MeetingAudioLanguage =
  (typeof MEETING_LANGUAGE_OPTIONS)[number]["value"]

export interface MeetingAudioFrameMetadata {
  stream_id: string
  encoding: MeetingAudioEncoding
  sample_rate: typeof MEETING_AUDIO_METADATA_DEFAULTS.sampleRate
  channels: typeof MEETING_AUDIO_METADATA_DEFAULTS.channels
  sequence: number
  timestamp_ms: number
}

export interface MeetingAudioPipelineConfig {
  language: MeetingAudioLanguage
  encoding: MeetingAudioEncoding
  sampleRate: typeof MEETING_AUDIO_METADATA_DEFAULTS.sampleRate
  channels: typeof MEETING_AUDIO_METADATA_DEFAULTS.channels
  frameDurationMs: typeof MEETING_AUDIO_METADATA_DEFAULTS.frameDurationMs
}

export interface MeetingAudioFrame {
  metadata: MeetingAudioFrameMetadata
  payload: ArrayBuffer
}

export interface MeetingAudioSourceDescriptor {
  role: MeetingSourceRole
  kind: "tab" | "microphone"
}

export interface MeetingAudioSourceHandle {
  role: MeetingSourceRole
  stream: MediaStream
  track: MediaStreamTrack
}

export interface MeetingMonoAudioChunk {
  samples: Int16Array
  sequence: number
  timestampMs: number
}
