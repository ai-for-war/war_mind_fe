import { CircleAlert, LoaderCircle } from "lucide-react"

import { ChainOfThoughtStep } from "@/components/ai/chain-of-thought"
import { Badge } from "@/components/ui/badge"
import type { SuperAgentInlineActivityStep } from "@/features/super-agent/types/chat-workspace.types"
import {
  formatSuperAgentToolStepSummary,
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
  const summary = formatSuperAgentToolStepSummary(step.toolName, step.arguments, step.result)
  const isFailed = step.status === "failed"
  const isActive = step.status === "active"
  const StepIcon = isFailed ? CircleAlert : isActive ? LoaderCircle : presentation.icon
  const statusLabel = step.status === "failed" ? "Failed" : step.status === "active" ? "Active" : "Complete"

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
          <Badge
            className={cn(
              "rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.16em]",
              isFailed
                ? "border-rose-300 bg-rose-100 text-rose-700 hover:bg-rose-100 dark:border-rose-300/30 dark:bg-rose-400/15 dark:text-rose-100"
                : isActive
                  ? "border-sky-300 bg-sky-100 text-sky-700 hover:bg-sky-100 dark:border-sky-300/30 dark:bg-sky-400/15 dark:text-sky-100"
                  : "border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-300/30 dark:bg-emerald-400/15 dark:text-emerald-100",
            )}
            variant="outline"
          >
            {statusLabel}
          </Badge>
        </div>
      }
      status={isActive ? "active" : "complete"}
    />
  )
}
