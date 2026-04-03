import { useState } from "react"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { cn } from "@/lib/utils"

type ComposerPanelProps = {
  className?: string
  draft: string
  isRuntimeReady?: boolean
  isSubmitting: boolean
  onDraftChange: (value: string) => void
  onSubmit: (text: string) => void
  runtimeError?: string | null
}

export const ComposerPanel = ({
  className,
  draft,
  isRuntimeReady = true,
  isSubmitting,
  onDraftChange,
  onSubmit,
  runtimeError,
}: ComposerPanelProps) => {
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = () => {
    const normalizedPrompt = draft.trim()
    if (normalizedPrompt.length === 0) {
      setValidationError("Prompt cannot be empty.")
      return
    }

    if (!isRuntimeReady) {
      setValidationError(runtimeError ?? "Choose a valid runtime before sending.")
      return
    }

    setValidationError(null)
    onSubmit(normalizedPrompt)
  }

  return (
    <div className={cn("shrink-0", className)}>
      <PromptInput
        className="mt-0"
        onSubmit={() => {
          handleSubmit()
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            className="min-h-0 h-11 max-h-20 py-2"
            disabled={isSubmitting || !isRuntimeReady}
            onChange={(event) => {
              if (validationError) {
                setValidationError(null)
              }
              onDraftChange(event.target.value)
            }}
            placeholder={
              isRuntimeReady ? "Type your next prompt..." : "Runtime catalog unavailable."
            }
            value={draft}
          />
        </PromptInputBody>

        <PromptInputFooter className="mt-1">
          <PromptInputTools />
          <PromptInputSubmit
            disabled={isSubmitting || !isRuntimeReady}
            status={isSubmitting ? "submitted" : "ready"}
          />
        </PromptInputFooter>
      </PromptInput>

      {validationError || runtimeError ? (
        <div className="mt-1 min-h-4 px-1">
          <p role="alert" className="text-xs text-destructive">
            {validationError ?? runtimeError}
          </p>
        </div>
      ) : null}
    </div>
  )
}
