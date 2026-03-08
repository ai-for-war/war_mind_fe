import { useState } from "react"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/prompt-input"

type ComposerPanelProps = {
  draft: string
  isSubmitting: boolean
  onDraftChange: (value: string) => void
  onSubmit: (text: string) => void
}

export const ComposerPanel = ({
  draft,
  isSubmitting,
  onDraftChange,
  onSubmit,
}: ComposerPanelProps) => {
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = () => {
    const normalizedPrompt = draft.trim()
    if (normalizedPrompt.length === 0) {
      setValidationError("Prompt cannot be empty.")
      return
    }

    setValidationError(null)
    onSubmit(normalizedPrompt)
  }

  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">Composer</p>
      <PromptInput
        className="mt-2"
        onSubmit={() => {
          handleSubmit()
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            className="min-h-[5.5rem]"
            disabled={isSubmitting}
            onChange={(event) => {
              if (validationError) {
                setValidationError(null)
              }
              onDraftChange(event.target.value)
            }}
            placeholder="Type your next prompt..."
            value={draft}
          />
        </PromptInputBody>

        <PromptInputFooter className="mt-2">
          <PromptInputTools />
          <PromptInputSubmit disabled={isSubmitting} status={isSubmitting ? "submitted" : "ready"} />
        </PromptInputFooter>
      </PromptInput>

      <div className="mt-1 flex items-center justify-between gap-2">
        {validationError ? (
          <p role="alert" className="text-xs text-destructive">
            {validationError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for newline.</p>
        )}
      </div>
    </div>
  )
}
