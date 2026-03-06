import { z } from "zod"

export const cloneVoiceSchema = z.object({
  file: z.custom<File | undefined>((value) => value instanceof File, {
    message: "Audio file is required",
  }),
  name: z
    .string()
    .trim()
    .min(1, "Voice name is required")
    .max(100, "Voice name must be at most 100 characters"),
  voiceId: z
    .string()
    .trim()
    .min(1, "Voice ID is required")
    .max(100, "Voice ID must be at most 100 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Voice ID can only contain letters, numbers, underscores, and hyphens",
    ),
})

export type CloneVoiceFormValues = z.infer<typeof cloneVoiceSchema>
