import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ConversationListItemRow } from "@/features/multi-agent/components/conversation-list-item"
import type { ConversationListItem } from "@/features/multi-agent/types/conversation.types"

type ConversationListProps = {
  activeConversationId: string | null
  conversations: ConversationListItem[]
  isEmpty: boolean
  isError: boolean
  isPending: boolean
  onRetry: () => void
  onSelectConversation: (conversationId: string) => void
}

const ConversationListSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={`conversation-skeleton-${index}`} className="rounded-lg border px-3 py-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-1/3" />
      </div>
    ))}
  </div>
)

export const ConversationList = ({
  activeConversationId,
  conversations,
  isEmpty,
  isError,
  isPending,
  onRetry,
  onSelectConversation,
}: ConversationListProps) => (
  <div className="min-h-0 flex-1">
    {isError ? (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div className="space-y-2">
            <p className="text-sm">Unable to load conversations.</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    ) : null}

    {isPending ? <ConversationListSkeleton /> : null}

    {!isPending && !isError && isEmpty ? (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
        <p className="text-sm font-medium">No conversations found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try another search or start a new chat.
        </p>
      </div>
    ) : null}

    {!isPending && !isError && !isEmpty ? (
      <ScrollArea className="h-[26rem] pr-2 xl:h-[calc(100vh-16rem)]">
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <ConversationListItemRow
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onSelect={onSelectConversation}
            />
          ))}
        </div>
      </ScrollArea>
    ) : null}
  </div>
)
