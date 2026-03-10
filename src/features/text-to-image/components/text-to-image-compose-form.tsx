import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ChevronDown, Loader2, Sparkles } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useCreateTextToImageJob } from "@/features/text-to-image/hooks"
import {
  textToImageSchema,
} from "@/features/text-to-image/schemas"
import {
  type CreateTextToImageJobRequest,
  TEXT_TO_IMAGE_ASPECT_RATIOS,
} from "@/features/text-to-image/types"

interface TextToImageComposeFormProps {
  initialValues?: Partial<CreateTextToImageJobRequest>
  onCreated?: (jobId: string) => void
}

type TextToImageFormInput = z.input<typeof textToImageSchema>
type TextToImageFormOutput = z.output<typeof textToImageSchema>

const getCreateErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return "Failed to create generation job. Please try again."
}

export const TextToImageComposeForm = ({
  initialValues,
  onCreated,
}: TextToImageComposeFormProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const createTextToImageJob = useCreateTextToImageJob()

  const form = useForm<TextToImageFormInput, undefined, TextToImageFormOutput>({
    resolver: zodResolver(textToImageSchema),
    defaultValues: {
      aspect_ratio: initialValues?.aspect_ratio ?? "1:1",
      prompt: initialValues?.prompt ?? "",
      prompt_optimizer: initialValues?.prompt_optimizer ?? false,
      seed: initialValues?.seed,
    },
  })

  const prompt = useWatch({
    control: form.control,
    name: "prompt",
  })
  const promptOptimizer = useWatch({
    control: form.control,
    name: "prompt_optimizer",
  })
  const aspectRatio = useWatch({
    control: form.control,
    name: "aspect_ratio",
  })

  const promptLength = prompt.length

  const createErrorMessage = useMemo(() => {
    if (!createTextToImageJob.error) {
      return null
    }

    return getCreateErrorMessage(createTextToImageJob.error)
  }, [createTextToImageJob.error])

  const handleClearCreateError = useCallback(() => {
    if (createTextToImageJob.error) {
      createTextToImageJob.reset()
    }
  }, [createTextToImageJob])

  const handleAspectRatioChange = useCallback(
    (value: string) => {
      if (!value) {
        return
      }

      handleClearCreateError()
      form.setValue("aspect_ratio", value as TextToImageFormInput["aspect_ratio"], {
        shouldDirty: true,
        shouldValidate: true,
      })
    },
    [form, handleClearCreateError],
  )

  const handlePromptOptimizerChange = useCallback(
    (checked: boolean) => {
      handleClearCreateError()
      form.setValue("prompt_optimizer", checked, {
        shouldDirty: true,
        shouldValidate: true,
      })
    },
    [form, handleClearCreateError],
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: CreateTextToImageJobRequest = {
      prompt: values.prompt,
      aspect_ratio: values.aspect_ratio,
      prompt_optimizer: values.prompt_optimizer,
      seed: typeof values.seed === "number" ? values.seed : undefined,
    }

    const response = await createTextToImageJob.mutateAsync(payload)
    onCreated?.(response.job_id)
  })

  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          Compose prompt
        </CardTitle>
        <CardDescription>
          Describe the image you want to generate with your preferred frame.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {createErrorMessage ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{createErrorMessage}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="text-to-image-prompt">Prompt</Label>
              <span
                className="text-xs text-muted-foreground"
                aria-live="polite"
                aria-atomic="true"
              >
                {promptLength} / 1500
              </span>
            </div>
            <textarea
              id="text-to-image-prompt"
              placeholder="A cinematic dusk battlefield with distant mountains, volumetric light, and realistic details..."
              rows={6}
              disabled={createTextToImageJob.isPending}
              aria-invalid={form.formState.errors.prompt ? "true" : "false"}
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
              {...form.register("prompt", {
                onChange: handleClearCreateError,
              })}
            />
            {form.formState.errors.prompt ? (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.prompt.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Aspect ratio</Label>
            <ToggleGroup
              type="single"
              value={aspectRatio}
              onValueChange={handleAspectRatioChange}
              variant="outline"
              className="flex w-full flex-wrap gap-2"
              disabled={createTextToImageJob.isPending}
              aria-label="Select aspect ratio"
            >
              {TEXT_TO_IMAGE_ASPECT_RATIOS.map((ratio) => (
                <ToggleGroupItem
                  key={ratio}
                  value={ratio}
                  className="min-w-14 rounded-md text-xs"
                  aria-label={`Aspect ratio ${ratio}`}
                >
                  {ratio}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {form.formState.errors.aspect_ratio ? (
              <p role="alert" className="text-sm text-destructive">
                {form.formState.errors.aspect_ratio.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-border/60 bg-muted/20 p-3">
            <div className="space-y-1">
              <Label htmlFor="prompt-optimizer">Prompt optimizer</Label>
              <p className="text-xs text-muted-foreground">
                Improve your prompt automatically for richer generation output.
              </p>
            </div>
            <Switch
              id="prompt-optimizer"
              checked={promptOptimizer ?? false}
              onCheckedChange={handlePromptOptimizerChange}
              disabled={createTextToImageJob.isPending}
            />
          </div>

          <Collapsible
            open={isAdvancedOpen}
            onOpenChange={setIsAdvancedOpen}
            className="space-y-3 rounded-md border border-border/60 p-3"
          >
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-between p-0 text-sm"
              >
                Advanced settings
                <ChevronDown
                  className={`size-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              <Label htmlFor="text-to-image-seed">Seed (optional)</Label>
              <Input
                id="text-to-image-seed"
                type="number"
                min={0}
                max={2147483647}
                step={1}
                placeholder="e.g. 123456"
                disabled={createTextToImageJob.isPending}
                aria-invalid={form.formState.errors.seed ? "true" : "false"}
                {...form.register("seed", {
                  onChange: handleClearCreateError,
                  setValueAs: (value) => {
                    if (value === "" || value === null || value === undefined) {
                      return undefined
                    }

                    return Number(value)
                  },
                })}
              />
              <p className="text-xs text-muted-foreground">
                Use the same seed to get more reproducible image composition.
              </p>
              {form.formState.errors.seed ? (
                <p role="alert" className="text-sm text-destructive">
                  {form.formState.errors.seed.message}
                </p>
              ) : null}
            </CollapsibleContent>
          </Collapsible>

          <Button type="submit" className="w-full" disabled={createTextToImageJob.isPending}>
            {createTextToImageJob.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating job...
              </>
            ) : (
              "Generate image"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
