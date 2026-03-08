import { useConversations } from "@/features/multi-agent/hooks/use-conversations"
import { useMultiAgentRailStore } from "@/features/multi-agent/stores/use-multi-agent-rail-store"

import { ConversationList } from "./conversation-list"
import { ConversationSearch } from "./conversation-search"

const RAIL_PAGE_SIZE = 30

export const ConversationRail = () => {
  const activeConversationId = useMultiAgentRailStore((state) => state.activeConversationId)
  const searchDraft = useMultiAgentRailStore((state) => state.searchDraft)
  const selectedStatus = useMultiAgentRailStore((state) => state.selectedStatus)
  const resetForNewChat = useMultiAgentRailStore((state) => state.resetForNewChat)
  const setActiveConversationId = useMultiAgentRailStore((state) => state.setActiveConversationId)
  const setSearchDraft = useMultiAgentRailStore((state) => state.setSearchDraft)
  const setSelectedStatus = useMultiAgentRailStore((state) => state.setSelectedStatus)

  const conversationsQuery = useConversations({
    limit: RAIL_PAGE_SIZE,
    search: searchDraft,
    skip: 0,
    status: selectedStatus,
  })

  return (
    <aside className="flex h-full min-h-[40rem] w-full max-w-full flex-col gap-4 rounded-xl border bg-card p-4 lg:w-[22rem] lg:min-w-[22rem]">
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Conversations</h2>
        <p className="text-xs text-muted-foreground">Browse and switch active conversations.</p>
      </header>

      <ConversationSearch
        onNewChat={resetForNewChat}
        onSearchDraftChange={setSearchDraft}
        onStatusChange={setSelectedStatus}
        searchDraft={searchDraft}
        selectedStatus={selectedStatus}
      />

      <ConversationList
        activeConversationId={activeConversationId}
        conversations={conversationsQuery.conversations}
        isEmpty={conversationsQuery.isEmpty}
        isError={conversationsQuery.isError}
        isPending={conversationsQuery.isPending}
        onRetry={() => void conversationsQuery.refetch()}
        onSelectConversation={setActiveConversationId}
      />
    </aside>
  )
}
