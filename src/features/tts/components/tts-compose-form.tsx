import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { ChevronDown, Loader2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useGenerateAudio } from "@/features/tts/hooks/use-generate-audio"
import {
  TTS_EMOTION_OPTIONS,
  ttsGenerateSchema,
  type TtsGenerateFormValues,
} from "@/features/tts/schemas/tts-generate.schema"
import type { GenerateAudioResponse } from "@/features/tts/types/tts.types"

import { VoiceSelector } from "./voice-selector"

const MAX_TEXT_LENGTH = 5000
const NONE_EMOTION_VALUE = "none"

type TtsComposeFormProps = {
  onGenerateSuccess: (response: GenerateAudioResponse) => void
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === "string" && data.trim().length > 0) {
      return data
    }

    if (
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string" &&
      data.message.trim().length > 0
    ) {
      return data.message
    }
  }

  return "Unable to generate audio right now. Please try again."
}

export const TtsComposeForm = ({ onGenerateSuccess }: TtsComposeFormProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const generateMutation = useGenerateAudio()

  const form = useForm<TtsGenerateFormValues>({
    resolver: zodResolver(ttsGenerateSchema),
    defaultValues: {
      emotion: undefined,
      pitch: 0,
      speed: 1,
      text: "",
      voice_id: "",
      volume: 1,
    },
  })

  const [voiceIdValue, textValue = "", emotionValue, speedValueRaw, volumeValueRaw, pitchValueRaw] =
    useWatch({
    control: form.control,
    name: ["voice_id", "text", "emotion", "speed", "volume", "pitch"],
  })
  const speedValue = speedValueRaw ?? 1
  const volumeValue = volumeValueRaw ?? 1
  const pitchValue = pitchValueRaw ?? 0

  const mutationError = useMemo(() => {
    if (!generateMutation.error) return null
    return getErrorMessage(generateMutation.error)
  }, [generateMutation.error])

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await generateMutation.mutateAsync({
        ...values,
        pitch: values.pitch ?? 0,
        speed: values.speed ?? 1,
        volume: values.volume ?? 1,
      })
      onGenerateSuccess(response)
    } catch {
      // Error is shown via mutation state.
    }
  })

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {mutationError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {mutationError}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="tts-voice">Voice</Label>
        <VoiceSelector
          value={voiceIdValue}
          disabled={generateMutation.isPending}
          onValueChange={(value) => {
            form.setValue("voice_id", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }}
        />
        {form.formState.errors.voice_id ? (
          <p className="text-sm text-destructive">{form.formState.errors.voice_id.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="tts-text">Text</Label>
          <p className="text-xs text-muted-foreground">
            {textValue.length} / {MAX_TEXT_LENGTH}
          </p>
        </div>
        <Textarea
          id="tts-text"
          rows={6}
          maxLength={MAX_TEXT_LENGTH}
          placeholder="Enter the text you want to convert into speech..."
          disabled={generateMutation.isPending}
          aria-invalid={form.formState.errors.text ? "true" : "false"}
          {...form.register("text")}
        />
        {form.formState.errors.text ? (
          <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
        ) : null}
      </div>

      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost" className="w-full justify-between px-0">
            Advanced Options
            <ChevronDown
              className={`size-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="tts-speed">Speed</Label>
              <span className="text-muted-foreground">{speedValue.toFixed(1)}x</span>
            </div>
            <Slider
              id="tts-speed"
              min={0.5}
              max={2}
              step={0.1}
              value={[speedValue]}
              disabled={generateMutation.isPending}
              onValueChange={(value) => {
                const nextValue = value[0]
                if (typeof nextValue !== "number") return
                form.setValue("speed", nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="tts-volume">Volume</Label>
              <span className="text-muted-foreground">{volumeValue.toFixed(1)}</span>
            </div>
            <Slider
              id="tts-volume"
              min={0.1}
              max={1}
              step={0.1}
              value={[volumeValue]}
              disabled={generateMutation.isPending}
              onValueChange={(value) => {
                const nextValue = value[0]
                if (typeof nextValue !== "number") return
                form.setValue("volume", nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label htmlFor="tts-pitch">Pitch</Label>
              <span className="text-muted-foreground">{pitchValue}</span>
            </div>
            <Slider
              id="tts-pitch"
              min={-12}
              max={12}
              step={1}
              value={[pitchValue]}
              disabled={generateMutation.isPending}
              onValueChange={(value) => {
                const nextValue = value[0]
                if (typeof nextValue !== "number") return
                form.setValue("pitch", nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tts-emotion">Emotion</Label>
            <Select
              value={emotionValue ?? NONE_EMOTION_VALUE}
              onValueChange={(value) => {
                form.setValue(
                  "emotion",
                  value === NONE_EMOTION_VALUE ? undefined : (value as TtsGenerateFormValues["emotion"]),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }}
              disabled={generateMutation.isPending}
            >
              <SelectTrigger id="tts-emotion" className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_EMOTION_VALUE}>None</SelectItem>
                {TTS_EMOTION_OPTIONS.map((emotion) => (
                  <SelectItem key={emotion} value={emotion}>
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button type="submit" className="w-full" disabled={generateMutation.isPending}>
        {generateMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Audio"
        )}
      </Button>
    </form>
  )
}
