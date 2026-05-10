import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { StockAgentConversationList } from "@/features/stock-agent/components/conversation-list"
import { useStockAgentConversations } from "@/features/stock-agent/hooks/use-conversations"
import { useStockAgentRailStore } from "@/features/stock-agent/stores/use-stock-agent-rail-store"
import { useDebouncedValue } from "@/features/super-agent/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

const RAIL_PAGE_SIZE = 30
const SEARCH_DEBOUNCE_MS = 350

type StockAgentConversationRailProps = {
  className?: string
  onConversationSelected?: () => void
  onNewChat?: () => void
}

export const StockAgentConversationRail = ({
  className,
  onConversationSelected,
  onNewChat,
}: StockAgentConversationRailProps) => {
  const activeConversationId = useStockAgentRailStore((state) => state.activeConversationId)
  const resetForNewChat = useStockAgentRailStore((state) => state.resetForNewChat)
  const searchDraft = useStockAgentRailStore((state) => state.searchDraft)
  const setActiveConversationId = useStockAgentRailStore((state) => state.setActiveConversationId)
  const setSearchDraft = useStockAgentRailStore((state) => state.setSearchDraft)
  const debouncedSearchDraft = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS)

  const conversationsQuery = useStockAgentConversations({
    limit: RAIL_PAGE_SIZE,
    search: debouncedSearchDraft,
    skip: 0,
    status: "active",
  })

  const handleNewChat = () => {
    resetForNewChat()
    onNewChat?.()
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId)
    onConversationSelected?.()
  }

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col gap-3 bg-background/45 p-3",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">Conversations</h2>
          <p className="truncate text-xs text-muted-foreground">Stock-agent history</p>
        </div>
        <Button aria-label="New stock chat" onClick={handleNewChat} size="icon-sm" type="button">
          <Plus className="size-4" />
        </Button>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search stock-agent conversations"
          className="h-9 pl-9"
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search chats..."
          value={searchDraft}
        />
      </div>

      <Separator />

      <StockAgentConversationList
        activeConversationId={activeConversationId}
        conversations={conversationsQuery.conversations}
        hasNextPage={conversationsQuery.hasNextPage}
        isEmpty={conversationsQuery.isEmpty}
        isError={conversationsQuery.isError}
        isFetchingNextPage={conversationsQuery.isFetchingNextPage}
        isPending={conversationsQuery.isPending}
        onLoadMore={() => void conversationsQuery.fetchNextPage()}
        onRetry={() => void conversationsQuery.refetch()}
        onSelectConversation={handleSelectConversation}
      />
    </aside>
  )
}
