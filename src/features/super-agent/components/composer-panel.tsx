import { Bot } from "lucide-react"
import { useState } from "react"

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  isSubagentEnabled: boolean
  onDraftChange: (value: string) => void
  onRetryRuntime: () => void
  onSelectModel: (args: { model: string; provider: string }) => void
  onSelectReasoning: (reasoning: string) => void
  onSubagentEnabledChange: (checked: boolean) => void
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
  isSubagentEnabled,
  onDraftChange,
  onRetryRuntime,
  onSelectModel,
  onSelectReasoning,
  onSubagentEnabledChange,
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
            <Label
              htmlFor="super-agent-subagent-toggle"
              className={cn(
                "flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs sm:text-sm",
                "cursor-pointer transition-colors",
                isSubagentEnabled
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-input bg-transparent text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                isSubmitting && "cursor-not-allowed opacity-70",
              )}
            >
              <Bot
                className={cn(
                  "size-3.5 shrink-0",
                  isSubagentEnabled ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="whitespace-nowrap font-medium">
                {isSubagentEnabled ? "Subagent" : "Agent"}
              </span>
              <Switch
                id="super-agent-subagent-toggle"
                checked={isSubagentEnabled}
                className="ml-1 data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground/15"
                disabled={isSubmitting}
                onCheckedChange={onSubagentEnabledChange}
                size="sm"
              />
            </Label>
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
