import { AlertCircle, Loader2, RefreshCw, Sparkles } from "lucide-react"

import { ConversationEmptyState } from "@/components/ai/conversation"
import { Suggestion, Suggestions } from "@/components/ai/suggestion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useConversationMessages } from "@/features/multi-agent/hooks/use-conversation-messages"
import { useMultiAgentRailStore } from "@/features/multi-agent/stores/use-multi-agent-rail-store"
import { useMultiAgentChatWorkspaceStore } from "@/features/multi-agent/stores/use-multi-agent-chat-workspace-store"
import { cn } from "@/lib/utils"

const FRESH_CHAT_SUGGESTIONS = [
  "Summarize recent updates in this project",
  "Draft a rollout plan for a new feature",
  "Help me debug a failing UI state",
  "Suggest acceptance tests for this workflow",
]

type ChatWorkspaceProps = {
  className?: string
}

const ChatWorkspaceLoading = () => (
  <div className="space-y-3">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-11/12" />
    <Skeleton className="h-4 w-2/3" />
    <div className="pt-2">
      <Skeleton className="h-10 w-28" />
    </div>
  </div>
)

type ChatWorkspaceErrorProps = {
  onRetry: () => void
}

const ChatWorkspaceError = ({ onRetry }: ChatWorkspaceErrorProps) => (
  <div
    role="alert"
    className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-3">
        <p className="text-sm font-medium">Unable to load this conversation.</p>
        <p className="text-xs text-destructive/90">
          Retry to fetch message history. The conversation rail is still available.
        </p>
        <Button onClick={onRetry} size="sm" type="button" variant="outline">
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    </div>
  </div>
)

type FreshChatStateProps = {
  onSuggestionClick: (value: string) => void
}

const FreshChatState = ({ onSuggestionClick }: FreshChatStateProps) => (
  <ConversationEmptyState
    className="items-start rounded-lg border border-dashed bg-muted/20 p-6 text-left"
    description="Choose a suggestion to prefill your first prompt, or start typing in the composer."
    icon={<Sparkles className="size-5" />}
    title="Start a fresh multi-agent chat"
  >
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium text-sm">Start a fresh multi-agent chat</h3>
        <p className="text-muted-foreground text-sm">
          Choose a suggestion to prefill your first prompt, or start typing in the composer.
        </p>
      </div>

      <Suggestions>
        {FRESH_CHAT_SUGGESTIONS.map((suggestion) => (
          <Suggestion
            key={suggestion}
            onClick={onSuggestionClick}
            suggestion={suggestion}
            variant="secondary"
          />
        ))}
      </Suggestions>
    </div>
  </ConversationEmptyState>
)

export const ChatWorkspace = ({ className }: ChatWorkspaceProps) => {
  const activeConversationId = useMultiAgentRailStore((state) => state.activeConversationId)
  const setComposerDraft = useMultiAgentChatWorkspaceStore((state) => state.setComposerDraft)
  const runStatusByConversation = useMultiAgentChatWorkspaceStore(
    (state) => state.runStatusByConversation,
  )
  const messagesQuery = useConversationMessages(activeConversationId)

  const runStatus = activeConversationId ? runStatusByConversation[activeConversationId] : "idle"

  const handleSuggestionClick = (value: string) => {
    setComposerDraft(null, value)
  }

  return (
    <main className={cn("min-h-[24rem] flex-1", className)}>
      <Card className="flex h-full min-h-[calc(100vh-16rem)] flex-col gap-0 lg:min-h-0">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <CardTitle>Chat Workspace</CardTitle>
              <CardDescription>
                {activeConversationId
                  ? "Review conversation context and continue from the composer."
                  : "No active conversation selected. Start a fresh chat from here."}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {activeConversationId ? `Run: ${runStatus ?? "idle"}` : "Fresh chat"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col py-6">
          {!activeConversationId ? (
            <FreshChatState onSuggestionClick={handleSuggestionClick} />
          ) : messagesQuery.isPending ? (
            <ChatWorkspaceLoading />
          ) : messagesQuery.isError ? (
            <ChatWorkspaceError onRetry={() => void messagesQuery.refetch()} />
          ) : (
            <div className="rounded-lg border bg-muted/10 p-5">
              <p className="text-sm font-medium">Conversation ready</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Loaded {messagesQuery.messages.length} message
                {messagesQuery.messages.length === 1 ? "" : "s"} for the active conversation.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5" />
                Thread rendering and composer submission are implemented in the next tasks.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
