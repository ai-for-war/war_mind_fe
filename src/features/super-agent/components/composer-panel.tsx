import { useState } from "react"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { SuperAgentRuntimePicker } from "@/features/super-agent/components/super-agent-runtime-picker"
import type {
  LeadAgentRuntimeCatalogResponse,
  SuperAgentRuntimeSelection,
} from "@/features/super-agent/types"
import { cn } from "@/lib/utils"

type ComposerPanelProps = {
  catalog: LeadAgentRuntimeCatalogResponse | null
  className?: string
  draft: string
  isRuntimeReady?: boolean
  isRuntimeRetrying?: boolean
  isRuntimeLoading?: boolean
  isSubmitting: boolean
  onDraftChange: (value: string) => void
  onRetryRuntime: () => void
  onSelectModel: (args: { model: string; provider: string }) => void
  onSelectReasoning: (reasoning: string) => void
  onSubmit: (text: string) => void
  runtimeError?: string | null
  runtimeSelection: SuperAgentRuntimeSelection | null
}

export const ComposerPanel = ({
  catalog,
  className,
  draft,
  isRuntimeReady = true,
  isRuntimeRetrying = false,
  isRuntimeLoading = false,
  isSubmitting,
  onDraftChange,
  onRetryRuntime,
  onSelectModel,
  onSelectReasoning,
  onSubmit,
  runtimeError,
  runtimeSelection,
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
          <PromptInputTools>
            <SuperAgentRuntimePicker
              catalog={catalog}
              isLoading={isRuntimeLoading}
              isRetrying={isRuntimeRetrying}
              onRetry={onRetryRuntime}
              onSelectModel={onSelectModel}
              onSelectReasoning={onSelectReasoning}
              runtimeError={runtimeError}
              selection={runtimeSelection}
            />
          </PromptInputTools>
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
