const TTS_QUERY_KEY = ["tts"] as const
const TTS_AUDIO_QUERY_KEY = [...TTS_QUERY_KEY, "audio"] as const

export const ttsQueryKeys = {
  all: TTS_QUERY_KEY,
  audioAll: TTS_AUDIO_QUERY_KEY,
  detail: (audioId?: string) => [...TTS_AUDIO_QUERY_KEY, audioId] as const,
  list: (skip = 0, limit = 20) =>
    [...TTS_AUDIO_QUERY_KEY, { skip, limit }] as const,
}
