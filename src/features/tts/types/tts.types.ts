export interface AudioFileRecord {
  id: string
  organization_id: string
  created_by: string
  voice_id: string
  source_text: string
  audio_url: string
  audio_public_id: string
  duration_ms: number
  size_bytes: number
  format: string
  created_at: string
}

export interface GenerateAudioRequest {
  text: string
  voice_id: string
  speed?: number
  volume?: number
  pitch?: number
  emotion?: string
}

export interface GenerateAudioResponse {
  audio: AudioFileRecord
  signed_url: string
}

export interface AudioListResponse {
  items: AudioFileRecord[]
  total: number
  skip: number
  limit: number
}

export interface AudioDetailResponse {
  audio: AudioFileRecord
  signed_url: string
}
