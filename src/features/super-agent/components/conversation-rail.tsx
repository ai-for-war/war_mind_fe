import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/features/super-agent/hooks/use-debounced-value"
import { useConversations } from "@/features/super-agent/hooks/use-conversations"
import { useSuperAgentRailStore } from "@/features/super-agent/stores/use-super-agent-rail-store"

import { ConversationList } from "./conversation-list"
import { ConversationSearch } from "./conversation-search"

const RAIL_PAGE_SIZE = 30
const SEARCH_DEBOUNCE_MS = 350

type ConversationRailProps = {
  className?: string
  onConversationSelected?: () => void
  onNewChat?: () => void
}

export const ConversationRail = ({
  className,
  onConversationSelected,
  onNewChat,
}: ConversationRailProps) => {
  const activeConversationId = useSuperAgentRailStore((state) => state.activeConversationId)
  const searchDraft = useSuperAgentRailStore((state) => state.searchDraft)
  const selectedStatus = useSuperAgentRailStore((state) => state.selectedStatus)
  const resetForNewChat = useSuperAgentRailStore((state) => state.resetForNewChat)
  const setActiveConversationId = useSuperAgentRailStore((state) => state.setActiveConversationId)
  const setSearchDraft = useSuperAgentRailStore((state) => state.setSearchDraft)
  const setSelectedStatus = useSuperAgentRailStore((state) => state.setSelectedStatus)
  const debouncedSearchDraft = useDebouncedValue(searchDraft, SEARCH_DEBOUNCE_MS)

  const handleNewChat = () => {
    resetForNewChat()
    onNewChat?.()
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId)
    onConversationSelected?.()
  }

  const conversationsQuery = useConversations({
    limit: RAIL_PAGE_SIZE,
    search: debouncedSearchDraft,
    skip: 0,
    status: selectedStatus,
  })

  return (
    <aside
      className={cn(
        "flex h-full min-h-[40rem] w-full max-w-full flex-col gap-4 rounded-xl border bg-card p-4 lg:w-[22rem] lg:min-w-[22rem]",
        className,
      )}
    >
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Conversations</h2>
        <p className="text-xs text-muted-foreground">Browse and switch active conversations.</p>
      </header>

      <ConversationSearch
        onNewChat={handleNewChat}
        onSearchDraftChange={setSearchDraft}
        onStatusChange={setSelectedStatus}
        searchDraft={searchDraft}
        selectedStatus={selectedStatus}
      />

      <ConversationList
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
