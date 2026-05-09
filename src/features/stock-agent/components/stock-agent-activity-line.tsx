import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import type { StockAgentActivityLineState } from "@/features/stock-agent/types"
import { cn } from "@/lib/utils"

type StockAgentActivityLineProps = {
  activity: StockAgentActivityLineState | null
  className?: string
}

const statusPresentation = {
  completed: {
    icon: CheckCircle2,
    label: "Completed",
    tone: "text-emerald-500",
  },
  failed: {
    icon: AlertCircle,
    label: "Failed",
    tone: "text-destructive",
  },
  streaming: {
    icon: Loader2,
    label: "Running",
    tone: "text-primary",
  },
} as const

export const StockAgentActivityLine = ({
  activity,
  className,
}: StockAgentActivityLineProps) => {
  if (!activity) {
    return null
  }

  const presentation = statusPresentation[activity.status]
  const Icon = presentation.icon
  const stepLabel = activity.actionCount === 1 ? "step" : "steps"

  return (
    <div
      className={cn(
        "flex min-h-10 items-center justify-between gap-3 border-t bg-background/70 px-4 py-2 text-xs backdrop-blur",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            presentation.tone,
            activity.status === "streaming" && "animate-spin",
          )}
        />
        <span className="sr-only">{presentation.label}</span>
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          initial={{ opacity: 0, scale: 0.96 }}
          key={activity.actionCount}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge className="whitespace-nowrap" variant="outline">
            {activity.actionCount} {stepLabel}
          </Badge>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
