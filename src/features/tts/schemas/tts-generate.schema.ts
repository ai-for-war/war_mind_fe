import { z } from "zod"

const EMOTIONS = [
  "happy",
  "sad",
  "angry",
  "fearful",
  "disgusted",
  "surprised",
] as const

export const ttsGenerateSchema = z.object({
  emotion: z.enum(EMOTIONS).optional(),
  pitch: z.number().min(-12).max(12).optional(),
  speed: z.number().min(0.5).max(2).optional(),
  text: z
    .string()
    .trim()
    .min(1, "Text is required")
    .max(5000, "Text must be at most 5000 characters"),
  voice_id: z.string().trim().min(1, "Voice is required"),
  volume: z.number().min(0.1).max(1).optional(),
})

export type TtsGenerateFormValues = z.infer<typeof ttsGenerateSchema>
export const TTS_EMOTION_OPTIONS = EMOTIONS
