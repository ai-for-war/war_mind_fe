import { Clock3 } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ImageGenerationJobStatus, ImageGenerationJobSummaryItem } from "@/features/text-to-image/types"

interface TextToImageHistoryItemProps {
  isSelected: boolean
  item: ImageGenerationJobSummaryItem
  onSelect: (jobId: string) => void
}

const STATUS_LABELS: Record<ImageGenerationJobStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  succeeded: "Succeeded",
  failed: "Failed",
  cancelled: "Cancelled",
}

const STATUS_BADGE_CLASSES: Record<ImageGenerationJobStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  processing: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  succeeded: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
  cancelled: "border-zinc-500/30 bg-zinc-500/15 text-zinc-300",
}

const getRelativeRequestedTime = (requestedAt: string): string => {
  const requestedDate = new Date(requestedAt)
  if (Number.isNaN(requestedDate.getTime())) {
    return "Unknown time"
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(requestedDate)
}

const getPromptExcerpt = (prompt: string): string => {
  const trimmedPrompt = prompt.trim()
  if (trimmedPrompt.length <= 96) {
    return trimmedPrompt
  }

  return `${trimmedPrompt.slice(0, 93)}...`
}

export const TextToImageHistoryItem = ({
  isSelected,
  item,
  onSelect,
}: TextToImageHistoryItemProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition-colors",
        "hover:border-primary/50 hover:bg-muted/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary/70 bg-primary/10"
          : "border-border/70 bg-card/80",
      )}
      aria-pressed={isSelected}
      aria-label={`Select generation ${item.id}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium",
            STATUS_BADGE_CLASSES[item.status],
          )}
        >
          {STATUS_LABELS[item.status]}
        </span>
        <span className="rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
          {item.aspect_ratio}
        </span>
      </div>

      <p className="line-clamp-2 text-sm leading-5 text-foreground">
        {getPromptExcerpt(item.prompt)}
      </p>

      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock3 className="size-3" />
        <span>{getRelativeRequestedTime(item.requested_at)}</span>
      </div>
    </button>
  )
}
