import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ConversationListItem } from "@/features/super-agent/types/conversation.types"

type ConversationListItemProps = {
  conversation: ConversationListItem
  isActive: boolean
  onSelect: (conversationId: string) => void
}

const formatRecency = (value: string | null): string => {
  if (!value) {
    return "No activity"
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return "Unknown time"
  }

  const now = Date.now()
  const diffMs = Math.max(now - timestamp, 0)
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) {
    return "Just now"
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  const diffDays = Math.floor(diffHours / 24)

  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(timestamp))
}

export const ConversationListItemRow = ({
  conversation,
  isActive,
  onSelect,
}: ConversationListItemProps) => (
  <button
    type="button"
    className={cn(
      "w-full rounded-lg border px-3 py-2 text-left transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isActive
        ? "border-primary/40 bg-primary/10"
        : "border-border bg-background hover:bg-muted/40",
    )}
    onClick={() => onSelect(conversation.id)}
  >
    <div className="flex items-center justify-between gap-2">
      <p className="line-clamp-1 text-sm font-medium">{conversation.title}</p>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatRecency(conversation.last_message_at ?? conversation.updated_at)}
      </span>
    </div>

    {conversation.preview ? (
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{conversation.preview}</p>
    ) : null}

    <div className="mt-2 flex items-center gap-2">
      {conversation.status === "archived" ? (
        <Badge variant="outline" className="h-5 px-2 text-[10px] uppercase tracking-wide">
          Archived
        </Badge>
      ) : null}
      <span className="text-[11px] text-muted-foreground">
        {conversation.message_count} messages
      </span>
    </div>
  </button>
)
