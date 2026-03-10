import { z } from "zod"

import { TEXT_TO_IMAGE_ASPECT_RATIOS } from "@/features/text-to-image/types"

export const textToImageSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(1500, "Prompt must be 1500 characters or less"),
  aspect_ratio: z.enum(TEXT_TO_IMAGE_ASPECT_RATIOS),
  seed: z
    .number()
    .int("Seed must be an integer")
    .min(0, "Seed must be at least 0")
    .max(2147483647, "Seed must be 2147483647 or lower")
    .optional(),
  prompt_optimizer: z.boolean().default(false),
})

export type TextToImageFormValues = z.infer<typeof textToImageSchema>
