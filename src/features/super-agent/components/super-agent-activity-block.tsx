import { useState } from "react"

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from "@/components/ai/chain-of-thought"
import { Badge } from "@/components/ui/badge"
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
  const [isOpen, setIsOpen] = useState(true)

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
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <ChainOfThoughtHeader
        className={cn(
          "gap-3 rounded-md px-1 py-0.5 text-xs hover:text-foreground",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 self-center">
          <span className="shrink-0">{toTraceTitle(trace)}</span>
          <Badge
            className="shrink-0 rounded-full border border-border/70 bg-background/80 px-2 py-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            variant="outline"
          >
            {trace.steps.length} step{trace.steps.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </ChainOfThoughtHeader>
      
      {
        isOpen ? (
          <ChainOfThoughtContent className="mt-0 space-y-3">
            {trace.steps.map((step, index) => (
              <SuperAgentActivityStep
                isLastStep={index === trace.steps.length - 1}
                key={step.toolCallId}
                step={step}
              />
            ))}
          </ChainOfThoughtContent>
        ) : null}
    </ChainOfThought>
  )
}
