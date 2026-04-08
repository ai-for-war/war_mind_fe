import { AlertCircle, CheckCircle2, ChevronDown, ListTodo } from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

import {
  getPlanTodoStatusLabel,
  getPlanTodoStatusStyles,
  normalizePlanTodoStatus,
} from "@/common/plan-todo"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import type {
  SuperAgentPlanSnapshot,
  SuperAgentRunStatus,
} from "@/features/super-agent/types/chat-workspace.types"
import { cn } from "@/lib/utils"

type SuperAgentPlanDockProps = {
  className?: string
  plan: SuperAgentPlanSnapshot
  runStatus: SuperAgentRunStatus
}

const PlanTodoStatusDot = ({ status }: { status: string }) => {
  const normalizedStatus = normalizePlanTodoStatus(status)
  const { dotClassName } = getPlanTodoStatusStyles(normalizedStatus)

  if (normalizedStatus === "in_progress") {
    return (
      <span aria-hidden="true" className="relative mt-1.5 size-2.5 shrink-0">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/25" />
        <span className={cn("absolute inset-0 m-auto size-1.5 rounded-full", dotClassName)} />
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", dotClassName)}
    />
  )
}

const getPlanHeadline = (plan: SuperAgentPlanSnapshot, runStatus: SuperAgentRunStatus): string => {
  if (runStatus === "failed") {
    return "Plan interrupted"
  }

  if (plan.summary.total > 0 && plan.summary.completed === plan.summary.total) {
    return "Plan completed"
  }

  return "In progress"
}

const getPlanSupportingText = (
  plan: SuperAgentPlanSnapshot,
  runStatus: SuperAgentRunStatus,
): string => {
  const activeTodo = plan.todos.find(
    (todo) => normalizePlanTodoStatus(todo.status) === "in_progress",
  )
  const lastCompletedTodo = [...plan.todos]
    .reverse()
    .find((todo) => normalizePlanTodoStatus(todo.status) === "completed")

  if (runStatus === "failed") {
    return activeTodo
      ? `Stopped at: ${activeTodo.content}`
      : "Something went wrong before the answer was completed."
  }

  if (plan.summary.total > 0 && plan.summary.completed === plan.summary.total) {
    return lastCompletedTodo
      ? `Last step: ${lastCompletedTodo.content}`
      : "This plan will reset when you send a new prompt."
  }

  if (activeTodo) {
    return activeTodo.content
  }

  return "AI is following a plan to answer this request."
}

export const SuperAgentPlanDock = ({
  className,
  plan,
  runStatus,
}: SuperAgentPlanDockProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const headline = getPlanHeadline(plan, runStatus)
  const supportingText = getPlanSupportingText(plan, runStatus)
  const completedPercentage =
    plan.summary.total > 0 ? (plan.summary.completed / plan.summary.total) * 100 : 0
  const isCompleted = plan.summary.total > 0 && plan.summary.completed === plan.summary.total
  const isFailed = runStatus === "failed"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-background/80 shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <button
        aria-expanded={isOpen}
        className="group flex w-full cursor-pointer flex-col gap-3 rounded-xl px-4 py-3 text-left outline-none transition-colors hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
              isFailed
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : isCompleted
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                  : "border-primary/20 bg-primary/10 text-primary",
            )}
          >
            {isFailed ? (
              <AlertCircle className="size-4" />
            ) : isCompleted ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <Spinner className="size-4" variant="infinite" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <ListTodo className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium text-sm text-foreground">Plan</span>
              </div>
              <Badge
                className={cn(
                  "rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.18em]",
                  isFailed
                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                    : isCompleted
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                      : "border-primary/20 bg-primary/5 text-primary",
                )}
                variant="outline"
              >
                {headline}
              </Badge>
              <Badge className="rounded-full px-2 py-0 text-[11px]" variant="outline">
                {plan.summary.completed}/{plan.summary.total} done
              </Badge>
            </div>

            <div className="flex items-start gap-2 text-sm">
              {!isCompleted && !isFailed ? <PlanTodoStatusDot status="in_progress" /> : null}
              <p
                className={cn(
                  "min-w-0 flex-1 leading-5",
                  isCompleted || isFailed ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {supportingText}
              </p>
            </div>
          </div>

          <ChevronDown
            className={cn(
              "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>

        <Progress
          aria-label="Plan progress"
          className="h-1.5 bg-muted"
          value={completedPercentage}
        />
      </button>

      <motion.div
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : -12,
        }}
        initial={false}
        transition={{
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div
          aria-hidden={!isOpen}
          className={cn("px-4 pb-4", !isOpen && "pointer-events-none")}
        >
          <div className="space-y-3 border-t border-border/60 pt-3">
            <p className="text-muted-foreground text-xs">
              {isCompleted
                ? "This plan will reset when you send a new prompt."
                : isFailed
                  ? "The agent stopped before finishing every planned step."
                  : "AI is following a plan to answer this request."}
            </p>

            <div className="max-h-[min(18rem,40vh)] overflow-y-auto pr-2">
              <div className="space-y-2">
                {plan.todos.map((todo, todoIndex) => {
                  const status = normalizePlanTodoStatus(todo.status)
                  const statusStyles = getPlanTodoStatusStyles(status)

                  return (
                    <div
                      className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
                      key={`${todo.content}-${todoIndex}`}
                    >
                      <PlanTodoStatusDot status={todo.status} />
                      <div className="min-w-0 flex-1">
                        <div className={cn("text-sm leading-5", statusStyles.textClassName)}>
                          {todo.content}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "shrink-0 rounded-md px-2 py-0.5 font-normal text-[11px]",
                          statusStyles.badgeClassName,
                        )}
                        variant="outline"
                      >
                        {getPlanTodoStatusLabel(status)}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
