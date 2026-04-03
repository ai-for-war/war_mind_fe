import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from "@/components/ai/chain-of-thought"
import type { SuperAgentInlineActivityTrace } from "@/features/super-agent/types/chat-workspace.types"
import { cn } from "@/lib/utils"

import { SuperAgentActivityStep } from "./super-agent-activity-step"

type SuperAgentActivityBlockProps = {
  className?: string
  trace: SuperAgentInlineActivityTrace
}

const toTraceTitle = (trace: SuperAgentInlineActivityTrace): string => {
  if (trace.status === "failed") {
    return "Activity failed"
  }

  if (trace.status === "completed") {
    return "Activity complete"
  }

  return "Working"
}

export const SuperAgentActivityBlock = ({
  className,
  trace,
}: SuperAgentActivityBlockProps) => {
  if (trace.steps.length === 0) {
    return null
  }

  return (
    <ChainOfThought
      className={cn(
        "max-w-none space-y-2 rounded-lg border border-border/60 bg-background/70 p-3 shadow-sm",
        className,
      )}
      defaultOpen
    >
      <ChainOfThoughtHeader className="gap-2 text-xs hover:text-foreground">
        {toTraceTitle(trace)}
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent className="mt-0 space-y-3">
        {trace.steps.map((step, index) => (
          <SuperAgentActivityStep
            isLastStep={index === trace.steps.length - 1}
            key={step.toolCallId}
            step={step}
          />
        ))}
      </ChainOfThoughtContent>
    </ChainOfThought>
  )
}
