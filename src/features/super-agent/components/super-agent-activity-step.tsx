import { CircleAlert, LoaderCircle } from "lucide-react"

import { ChainOfThoughtStep } from "@/components/ai/chain-of-thought"
import type { SuperAgentInlineActivityStep } from "@/features/super-agent/types/chat-workspace.types"
import {
  formatSuperAgentToolArgumentsSummary,
  getSuperAgentToolPresentation,
} from "@/features/super-agent/utils/tool-presentation"
import { cn } from "@/lib/utils"

type SuperAgentActivityStepProps = {
  className?: string
  isLastStep: boolean
  step: SuperAgentInlineActivityStep
}

export const SuperAgentActivityStep = ({
  className,
  isLastStep,
  step,
}: SuperAgentActivityStepProps) => {
  const presentation = getSuperAgentToolPresentation(step.toolName)
  const summary = formatSuperAgentToolArgumentsSummary(step.toolName, step.arguments)
  const isFailed = step.status === "failed"
  const isActive = step.status === "active"
  const StepIcon = isFailed ? CircleAlert : isActive ? LoaderCircle : presentation.icon

  return (
    <ChainOfThoughtStep
      className={cn(
        "gap-3 text-sm",
        isFailed ? "text-destructive" : undefined,
        !isLastStep ? "[&>div:first-child>div]:block" : "[&>div:first-child>div]:hidden",
        isActive ? "[&_svg]:animate-spin" : undefined,
        className,
      )}
      description={summary ?? undefined}
      icon={StepIcon}
      label={
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{presentation.label}</span>
          <span
            className={cn(
              "text-[11px] uppercase tracking-[0.18em]",
              isFailed
                ? "text-destructive/80"
                : isActive
                  ? "text-foreground/70"
                  : "text-muted-foreground",
            )}
          >
            {step.status}
          </span>
        </div>
      }
      status={isActive ? "active" : "complete"}
    />
  )
}
