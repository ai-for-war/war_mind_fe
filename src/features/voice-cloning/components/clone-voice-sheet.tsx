import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"
import { useForm } from "react-hook-form"

import { FileDropzone } from "@/components/common/file-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCloneVoice } from "@/features/voice-cloning/hooks/use-clone-voice"
import {
  cloneVoiceSchema,
  type CloneVoiceFormValues,
} from "@/features/voice-cloning/schemas/clone-voice.schema"

type CloneVoiceSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
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

  return "Unable to clone voice right now. Please try again."
}

export const CloneVoiceSheet = ({ open, onOpenChange }: CloneVoiceSheetProps) => {
  const cloneVoiceMutation = useCloneVoice()

  const form = useForm<CloneVoiceFormValues>({
    resolver: zodResolver(cloneVoiceSchema),
    defaultValues: {
      file: undefined,
      name: "",
      voiceId: "",
    },
  })

  const mutationError = useMemo(() => {
    if (!cloneVoiceMutation.error) return null
    return getErrorMessage(cloneVoiceMutation.error)
  }, [cloneVoiceMutation.error])

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!values.file) {
      return
    }

    try {
      await cloneVoiceMutation.mutateAsync({
        file: values.file,
        name: values.name,
        voiceId: values.voiceId,
      })
      form.reset()
      onOpenChange(false)
    } catch {
      // Error is shown through mutation state.
    }
  })

  const handleFileSelect = (file: File | null) => {
    if (cloneVoiceMutation.error) {
      cloneVoiceMutation.reset()
    }

    form.setValue("file", file ?? undefined, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Clone Voice</SheetTitle>
          <SheetDescription>
            Upload source audio and define a unique voice ID for your cloned voice.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex h-full flex-col gap-5 overflow-y-auto px-4 pb-4"
          onSubmit={handleSubmit}
        >
          {mutationError ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {mutationError}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Source Audio</Label>
            <FileDropzone
              preset="audio"
              disabled={cloneVoiceMutation.isPending}
              onFileSelect={handleFileSelect}
            />
            {form.formState.errors.file ? (
              <p className="text-sm text-destructive">{form.formState.errors.file.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clone-voice-name">Voice Name</Label>
            <Input
              id="clone-voice-name"
              placeholder="General Duy"
              disabled={cloneVoiceMutation.isPending}
              aria-invalid={form.formState.errors.name ? "true" : "false"}
              {...form.register("name", {
                onChange: () => {
                  if (cloneVoiceMutation.error) {
                    cloneVoiceMutation.reset()
                  }
                },
              })}
            />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clone-voice-id">Voice ID</Label>
            <Input
              id="clone-voice-id"
              placeholder="general_duy_001"
              disabled={cloneVoiceMutation.isPending}
              aria-invalid={form.formState.errors.voiceId ? "true" : "false"}
              {...form.register("voiceId", {
                onChange: () => {
                  if (cloneVoiceMutation.error) {
                    cloneVoiceMutation.reset()
                  }
                },
              })}
            />
            <p className="text-xs text-muted-foreground">
              Use letters, numbers, underscores, and hyphens only.
            </p>
            {form.formState.errors.voiceId ? (
              <p className="text-sm text-destructive">{form.formState.errors.voiceId.message}</p>
            ) : null}
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button type="submit" disabled={cloneVoiceMutation.isPending}>
              {cloneVoiceMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Cloning...
                </>
              ) : (
                "Clone Voice"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
