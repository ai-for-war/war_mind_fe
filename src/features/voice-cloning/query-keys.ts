const VOICES_QUERY_KEY = ["voices"] as const

export const voiceQueryKeys = {
  all: VOICES_QUERY_KEY,
  detail: (voiceId?: string) => [...VOICES_QUERY_KEY, voiceId] as const,
}
