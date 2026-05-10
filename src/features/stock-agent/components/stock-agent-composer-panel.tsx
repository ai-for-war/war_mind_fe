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
import { StockAgentRuntimePicker } from "@/features/stock-agent/components/stock-agent-runtime-picker"
import type {
  StockAgentRuntimeCatalogResponse,
  StockAgentRuntimeSelection,
} from "@/features/stock-agent/types"
import { cn } from "@/lib/utils"

type StockAgentComposerPanelProps = {
  catalog: StockAgentRuntimeCatalogResponse | null
  className?: string
  draft: string
  isRuntimeLoading?: boolean
  isRuntimeReady?: boolean
  isRuntimeRetrying?: boolean
  isSubmitting: boolean
  isSubagentEnabled: boolean
  onDraftChange: (value: string) => void
  onRetryRuntime: () => void
  onSelectModel: (args: { model: string; provider: string }) => void
  onSelectReasoning: (reasoning: string) => void
  onSubagentEnabledChange: (checked: boolean) => void
  onSubmit: (text: string) => void
  runtimeError?: string | null
  runtimeSelection: StockAgentRuntimeSelection | null
}

export const StockAgentComposerPanel = ({
  catalog,
  className,
  draft,
  isRuntimeLoading = false,
  isRuntimeReady = true,
  isRuntimeRetrying = false,
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
}: StockAgentComposerPanelProps) => {
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
    <div className={cn("shrink-0 border-t bg-background/80 backdrop-blur", className)}>
      <PromptInput onSubmit={() => handleSubmit()}>
        <PromptInputBody>
          <PromptInputTextarea
            className="min-h-12 max-h-28 py-2"
            disabled={isSubmitting || !isRuntimeReady}
            onChange={(event) => {
              if (validationError) {
                setValidationError(null)
              }
              onDraftChange(event.target.value)
            }}
            placeholder={isRuntimeReady ? "Ask the Stock Agent..." : "Runtime catalog unavailable."}
            value={draft}
          />
        </PromptInputBody>

        <PromptInputFooter className="mt-1">
          <PromptInputTools className="min-w-0 flex-wrap">
            <Label
              className={cn(
                "flex h-8 items-center gap-2 rounded-md border px-2.5 text-xs",
                "cursor-pointer transition-colors",
                isSubagentEnabled
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-input bg-transparent text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                isSubmitting && "cursor-not-allowed opacity-70",
              )}
              htmlFor="stock-agent-subagent-toggle"
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
                checked={isSubagentEnabled}
                className="ml-1 data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground/15"
                disabled={isSubmitting}
                id="stock-agent-subagent-toggle"
                onCheckedChange={onSubagentEnabledChange}
                size="sm"
              />
            </Label>
            <StockAgentRuntimePicker
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
          <p className="text-xs text-destructive" role="alert">
            {validationError ?? runtimeError}
          </p>
        </div>
      ) : null}
    </div>
  )
}
