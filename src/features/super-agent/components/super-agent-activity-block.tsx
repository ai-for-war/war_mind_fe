import { CheckCircle2, CircleAlert } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from "@/components/ai/chain-of-thought"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import type { SuperAgentInlineActivityTrace } from "@/features/super-agent/types/chat-workspace.types"
import { getSuperAgentToolPresentation } from "@/features/super-agent/utils/tool-presentation"
import { cn } from "@/lib/utils"

import { SuperAgentActivityStep } from "./super-agent-activity-step"

type SuperAgentActivityBlockProps = {
  className?: string
  trace: SuperAgentInlineActivityTrace
}

const ACTIVITY_TRANSITION = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const

const toTraceTitle = (trace: SuperAgentInlineActivityTrace): string => {
  if (trace.status === "failed") {
    return "Activity failed"
  }

  if (trace.status === "completed") {
    return "Activity complete"
  }

  return "Working"
}

const SuperAgentActivitySummary = ({
  isOpen,
  trace,
}: {
  isOpen: boolean
  trace: SuperAgentInlineActivityTrace
}) => {
  const latestStep = trace.steps.at(-1) ?? null
  const latestPresentation = latestStep
    ? getSuperAgentToolPresentation(latestStep.toolName)
    : null
  const isLatestStepActive = latestStep?.status === "active"
  const isLatestStepFailed = latestStep?.status === "failed"
  const stepLabel = trace.steps.length === 1 ? "step" : "steps"

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 self-center">
      <span className="shrink-0">{toTraceTitle(trace)}</span>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {!isOpen && latestPresentation ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex min-w-0 items-center gap-2"
              exit={{ opacity: 0, y: -4 }}
              initial={{ opacity: 0, y: 4 }}
              key="collapsed-summary"
              transition={ACTIVITY_TRANSITION}
            >
              {isLatestStepActive ? (
                <Spinner className="size-3.5 shrink-0 text-primary" variant="infinite" />
              ) : isLatestStepFailed ? (
                <CircleAlert className="size-3.5 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
              )}
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="truncate text-muted-foreground"
                exit={{ opacity: 0, y: -6 }}
                initial={{ opacity: 0, y: 6 }}
                key={`${latestStep?.toolCallId}:${latestStep?.status}`}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {latestPresentation.label}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1 }}
              className="h-4"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="expanded-spacer"
              transition={{ duration: 0.14 }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          initial={{ opacity: 0, scale: 0.96 }}
          key={trace.steps.length}
          transition={ACTIVITY_TRANSITION}
        >
          <Badge
            className="shrink-0 rounded-full border border-border/70 bg-background/80 px-2 py-0 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
            variant="outline"
          >
            {trace.steps.length} {stepLabel}
          </Badge>
        </motion.div>
      </AnimatePresence>
    </div>
  )
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
        <SuperAgentActivitySummary isOpen={isOpen} trace={trace} />
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
