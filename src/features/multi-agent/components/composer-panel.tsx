import { useState } from "react";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/prompt-input";
import { cn } from "@/lib/utils";

type ComposerPanelProps = {
  className?: string;
  draft: string;
  isSubmitting: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: (text: string) => void;
};

export const ComposerPanel = ({
  className,
  draft,
  isSubmitting,
  onDraftChange,
  onSubmit,
}: ComposerPanelProps) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    const normalizedPrompt = draft.trim();
    if (normalizedPrompt.length === 0) {
      setValidationError("Prompt cannot be empty.");
      return;
    }

    setValidationError(null);
    onSubmit(normalizedPrompt);
  };

  return (
    <div className={cn("shrink-0", className)}>
      <PromptInput
        className="mt-0"
        onSubmit={() => {
          handleSubmit();
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            className="min-h-0 h-11 max-h-20 py-2"
            disabled={isSubmitting}
            onChange={(event) => {
              if (validationError) {
                setValidationError(null);
              }
              onDraftChange(event.target.value);
            }}
            placeholder="Type your next prompt..."
            value={draft}
          />
        </PromptInputBody>

        <PromptInputFooter className="mt-1">
          <PromptInputTools />
          <PromptInputSubmit
            disabled={isSubmitting}
            status={isSubmitting ? "submitted" : "ready"}
          />
        </PromptInputFooter>
      </PromptInput>

      {validationError ? (
        <div className="mt-1 min-h-4 px-1">
          <p role="alert" className="text-xs text-destructive">
            {validationError}
          </p>
        </div>
      ) : null}
    </div>
  );
};
