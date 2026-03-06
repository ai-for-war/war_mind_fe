export interface VoiceRecord {
  id: string
  voice_id: string
  name: string
  voice_type: string
  organization_id: string
  created_by: string
  source_audio_url: string
  source_audio_public_id: string
  language: string | null
  created_at: string
}

export interface SystemVoiceRecord {
  voice_id: string
  voice_name: string
  description: string[]
  created_time: string | null
}

export interface VoiceListResponse {
  system_voices: SystemVoiceRecord[]
  cloned_voices: VoiceRecord[]
  total_cloned: number
}

export interface VoiceDetailResponse {
  voice: VoiceRecord
  source_audio_signed_url: string | null
}

export interface CloneVoiceResponse {
  voice: VoiceRecord
  preview_url: string | null
}
