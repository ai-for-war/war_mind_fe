import {
  AlertCircle,
  CheckCircle2,
  MessageSquareDashed,
  Sparkles,
} from "lucide-react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type ChatWorkspaceStatusTone = "fresh" | "pending" | "streaming" | "success" | "danger"

type ChatWorkspaceStatusRunState = "idle" | "submitting" | "streaming" | "completed" | "failed"

type ChatWorkspaceStatusState = {
  icon: typeof Sparkles
  label: string
  tone: ChatWorkspaceStatusTone
}

const resolveChatWorkspaceStatusState = ({
  activeConversationId,
  runStatus,
}: {
  activeConversationId: string | null
  runStatus: ChatWorkspaceStatusRunState
}): ChatWorkspaceStatusState => {
  if (!activeConversationId && runStatus === "idle") {
    return {
      icon: MessageSquareDashed,
      label: "Fresh chat",
      tone: "fresh",
    }
  }

  switch (runStatus) {
    case "submitting":
      return {
        icon: Sparkles,
        label: "Submitting",
        tone: "pending",
      }
    case "streaming":
      return {
        icon: Sparkles,
        label: "Streaming",
        tone: "streaming",
      }
    case "completed":
      return {
        icon: CheckCircle2,
        label: "Completed",
        tone: "success",
      }
    case "failed":
      return {
        icon: AlertCircle,
        label: "Failed",
        tone: "danger",
      }
    case "idle":
    default:
      return {
        icon: Sparkles,
        label: "Ready",
        tone: "fresh",
      }
  }
}

const statusToneClassName: Record<ChatWorkspaceStatusTone, string> = {
  danger:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-500/8 dark:text-red-100",
  fresh:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/8 dark:text-sky-100",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/8 dark:text-amber-100",
  streaming:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/8 dark:text-violet-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/8 dark:text-emerald-100",
}

type ChatWorkspaceStatusProps = {
  activeConversationId: string | null
  runStatus: ChatWorkspaceStatusRunState
}

export const ChatWorkspaceStatus = ({
  activeConversationId,
  runStatus,
}: ChatWorkspaceStatusProps) => {
  const status = resolveChatWorkspaceStatusState({ activeConversationId, runStatus })
  const Icon = status.icon
  const isAnimated = runStatus === "submitting"

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center gap-2.5 rounded-full border px-3.5 pr-4 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.12)] transition-colors dark:shadow-[0_8px_24px_-20px_rgba(15,23,42,0.9)]",
        statusToneClassName[status.tone],
      )}
    >
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-current/12 bg-white/70 dark:bg-white/7">
        {runStatus === "streaming" ? (
          <Spinner className="size-3.5 text-current" variant="infinite" />
        ) : (
          <Icon className={cn("size-3.5 text-current", isAnimated && "animate-pulse")} />
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium text-sm text-current">{status.label}</p>
      </div>
    </div>
  )
}
