import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai/chain-of-thought"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import type {
  StockAgentActivityLineState,
  StockAgentActivityStep,
} from "@/features/stock-agent/types"
import { formatAiToolArgumentsSummary, getAiToolPresentation } from "@/lib/ai-tool-presentation"
import { cn } from "@/lib/utils"

type StockAgentActivityLineProps = {
  activity: StockAgentActivityLineState | null
  className?: string
}

type StockAgentActivityStepProps = {
  className?: string
  isLastStep: boolean
  step: StockAgentActivityStep
}

const toActivityTitle = (activity: StockAgentActivityLineState): string => {
  if (activity.status === "failed") {
    return "Activity failed"
  }

  if (activity.status === "completed") {
    return "Activity complete"
  }

  return "Working"
}

const StockAgentActivitySummary = ({
  activity,
  isOpen,
}: {
  activity: StockAgentActivityLineState
  isOpen: boolean
}) => {
  const latestStep =
    activity.steps.find((step) => step.toolCallId === activity.latestToolCallId) ??
    activity.steps.at(-1) ??
    null
  const isLatestStepActive = latestStep?.status === "active"
  const isLatestStepFailed = latestStep?.status === "failed"
  const stepLabel = activity.actionCount === 1 ? "step" : "steps"

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 self-center">
      <span className="shrink-0">{toActivityTitle(activity)}</span>

      {!isOpen ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {isLatestStepActive ? (
            <Spinner className="size-3.5 shrink-0 text-primary" variant="infinite" />
          ) : isLatestStepFailed ? (
            <CircleAlert className="size-3.5 shrink-0 text-destructive" />
          ) : (
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
          )}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="truncate text-muted-foreground"
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: 6 }}
                key={`${activity.latestAction}:${activity.updatedAt}`}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {activity.latestAction}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="min-w-0 flex-1" />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          initial={{ opacity: 0, scale: 0.96 }}
          key={activity.actionCount}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge
            className="shrink-0 rounded-full border border-border/70 bg-background/80 px-2 py-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            variant="outline"
          >
            {activity.actionCount} {stepLabel}
          </Badge>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const StockAgentActivityStepRow = ({
  className,
  isLastStep,
  step,
}: StockAgentActivityStepProps) => {
  const presentation = getAiToolPresentation(step.toolName)
  const summary = formatAiToolArgumentsSummary(step.toolName, step.arguments)
  const isFailed = step.status === "failed"
  const isActive = step.status === "active"
  const StepIcon = isFailed ? CircleAlert : isActive ? LoaderCircle : presentation.icon
  const statusLabel =
    step.status === "failed" ? "Failed" : step.status === "active" ? "Active" : "Complete"

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

export const StockAgentActivityLine = ({
  activity,
  className,
}: StockAgentActivityLineProps) => {
  const [isOpen, setIsOpen] = useState(true)

  if (!activity || activity.steps.length === 0) {
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
      <ChainOfThoughtHeader className="gap-3 rounded-md px-1 py-0.5 text-xs hover:text-foreground">
        <StockAgentActivitySummary activity={activity} isOpen={isOpen} />
      </ChainOfThoughtHeader>

      {isOpen ? (
        <ChainOfThoughtContent className="mt-0 space-y-3">
          {activity.steps.map((step, index) => (
            <StockAgentActivityStepRow
              isLastStep={index === activity.steps.length - 1}
              key={step.toolCallId}
              step={step}
            />
          ))}
        </ChainOfThoughtContent>
      ) : null}
    </ChainOfThought>
  )
}
