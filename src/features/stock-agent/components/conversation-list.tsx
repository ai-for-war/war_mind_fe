import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { StockAgentConversationListItemRow } from "@/features/stock-agent/components/conversation-list-item"
import type { StockAgentConversationListItem } from "@/features/stock-agent/types"
import { useScrollAreaInfiniteScroll } from "@/hooks/use-scroll-area-infinite-scroll"

type StockAgentConversationListProps = {
  activeConversationId: string | null
  conversations: StockAgentConversationListItem[]
  hasNextPage: boolean
  isEmpty: boolean
  isError: boolean
  isFetchingNextPage: boolean
  isPending: boolean
  onLoadMore: () => void
  onRetry: () => void
  onSelectConversation: (conversationId: string) => void
}

const StockAgentConversationListSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div className="rounded-md border px-3 py-2" key={`stock-agent-conversation-skeleton-${index}`}>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-1/3" />
      </div>
    ))}
  </div>
)

export const StockAgentConversationList = ({
  activeConversationId,
  conversations,
  hasNextPage,
  isEmpty,
  isError,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  onRetry,
  onSelectConversation,
}: StockAgentConversationListProps) => {
  const { scrollAreaRef, sentinelRef } = useScrollAreaInfiniteScroll({
    hasNextPage,
    isEnabled: !isPending && !isError && !isEmpty,
    isFetchingNextPage,
    onLoadMore,
  })

  return (
    <div className="min-h-0 flex-1">
      {isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-2">
              <p className="text-sm">Unable to load stock-agent conversations.</p>
              <Button onClick={onRetry} size="sm" type="button" variant="outline">
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isPending ? <StockAgentConversationListSkeleton /> : null}

      {!isPending && !isError && isEmpty ? (
        <Empty className="min-h-48 border border-dashed bg-muted/20 p-4">
          <EmptyHeader>
            <EmptyTitle className="text-sm">No conversations found</EmptyTitle>
            <EmptyDescription className="text-xs">
              Try another search or start a new stock chat.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!isPending && !isError && !isEmpty ? (
        <ScrollArea className="h-full min-h-0 pr-2" ref={scrollAreaRef}>
          <div className="flex flex-col gap-2">
            {conversations.map((conversation) => (
              <StockAgentConversationListItemRow
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                key={conversation.id}
                onSelect={onSelectConversation}
              />
            ))}

            {isFetchingNextPage ? <StockAgentConversationListSkeleton /> : null}
            <div aria-hidden="true" className="h-1" ref={sentinelRef} />
          </div>
        </ScrollArea>
      ) : null}
    </div>
  )
}
