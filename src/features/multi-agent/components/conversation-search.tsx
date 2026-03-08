import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ConversationStatusFilter } from "@/features/multi-agent/types/conversation.types"

type ConversationSearchProps = {
  onNewChat: () => void
  onSearchDraftChange: (value: string) => void
  onStatusChange: (status: ConversationStatusFilter) => void
  searchDraft: string
  selectedStatus: ConversationStatusFilter
}

export const ConversationSearch = ({
  onNewChat,
  onSearchDraftChange,
  onStatusChange,
  searchDraft,
  selectedStatus,
}: ConversationSearchProps) => (
  <div className="space-y-3">
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchDraft}
        onChange={(event) => onSearchDraftChange(event.target.value)}
        placeholder="Search conversations..."
        className="pl-9"
        aria-label="Search conversations"
      />
    </div>

    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={selectedStatus === "active" ? "secondary" : "outline"}
          size="sm"
          onClick={() => onStatusChange("active")}
        >
          Active
        </Button>
        <Button
          type="button"
          variant={selectedStatus === "archived" ? "secondary" : "outline"}
          size="sm"
          onClick={() => onStatusChange("archived")}
        >
          Archived
        </Button>
      </div>

      <Button type="button" size="sm" onClick={onNewChat}>
        New chat
      </Button>
    </div>
  </div>
)
