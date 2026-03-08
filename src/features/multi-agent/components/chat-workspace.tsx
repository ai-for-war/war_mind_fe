import { AlertCircle, RefreshCw, Sparkles } from "lucide-react"
import { useState } from "react"

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
import { ChatThread } from "@/features/multi-agent/components/chat-thread"
import { ComposerPanel } from "@/features/multi-agent/components/composer-panel"
import { useConversationMessages } from "@/features/multi-agent/hooks/use-conversation-messages"
import { useSendMessage } from "@/features/multi-agent/hooks/use-send-message"
import {
  MULTI_AGENT_FRESH_CHAT_KEY,
  toMultiAgentConversationKey,
  useMultiAgentChatWorkspaceStore,
} from "@/features/multi-agent/stores/use-multi-agent-chat-workspace-store"
import { useMultiAgentRailStore } from "@/features/multi-agent/stores/use-multi-agent-rail-store"
import type {
  MultiAgentMessageRecord,
  MultiAgentRunStatus,
} from "@/features/multi-agent/types/chat-workspace.types"
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

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return "Failed to submit prompt. Please try again."
}

const createOptimisticFreshMessage = (content: string): MultiAgentMessageRecord => ({
  attachments: null,
  content,
  conversation_id: MULTI_AGENT_FRESH_CHAT_KEY,
  created_at: new Date().toISOString(),
  id: `optimistic-fresh-${Date.now()}`,
  is_complete: true,
  metadata: { optimistic: true },
  role: "user",
})

export const ChatWorkspace = ({ className }: ChatWorkspaceProps) => {
  const activeConversationId = useMultiAgentRailStore((state) => state.activeConversationId)
  const setActiveConversationId = useMultiAgentRailStore((state) => state.setActiveConversationId)
  const clearComposerDraft = useMultiAgentChatWorkspaceStore((state) => state.clearComposerDraft)
  const composerDraftByConversation = useMultiAgentChatWorkspaceStore(
    (state) => state.composerDraftByConversation,
  )
  const runStatusByConversation = useMultiAgentChatWorkspaceStore(
    (state) => state.runStatusByConversation,
  )
  const setComposerDraft = useMultiAgentChatWorkspaceStore((state) => state.setComposerDraft)
  const setRunStatus = useMultiAgentChatWorkspaceStore((state) => state.setRunStatus)
  const setThreadError = useMultiAgentChatWorkspaceStore((state) => state.setThreadError)

  const [freshChatOptimisticMessage, setFreshChatOptimisticMessage] =
    useState<MultiAgentMessageRecord | null>(null)
  const messagesQuery = useConversationMessages(activeConversationId)
  const sendMessageMutation = useSendMessage()

  const conversationKey = toMultiAgentConversationKey(activeConversationId)
  const draft = composerDraftByConversation[conversationKey] ?? ""
  const runStatus = (runStatusByConversation[conversationKey] ?? "idle") satisfies MultiAgentRunStatus
  const isSubmitting = runStatus === "submitting"

  const badgeLabel =
    activeConversationId || runStatus !== "idle" ? `Run: ${runStatus}` : "Fresh chat"

  const handleSuggestionClick = (value: string) => {
    setComposerDraft(null, value)
  }

  const handleSubmitPrompt = async (inputText: string) => {
    const prompt = inputText.trim()
    if (prompt.length === 0) {
      return
    }

    const submitKey = conversationKey
    setRunStatus(submitKey, "submitting")
    setThreadError(submitKey, null)

    if (!activeConversationId) {
      setFreshChatOptimisticMessage(createOptimisticFreshMessage(prompt))
    }

    try {
      const result = await sendMessageMutation.mutateAsync({
        content: prompt,
        conversation_id: activeConversationId,
      })

      clearComposerDraft(activeConversationId)

      if (!activeConversationId) {
        setFreshChatOptimisticMessage(null)
        setActiveConversationId(result.conversation_id)
      }

      setRunStatus(submitKey, "idle")
      setThreadError(submitKey, null)
    } catch (error) {
      setRunStatus(submitKey, "failed")
      setThreadError(submitKey, resolveErrorMessage(error))
    }
  }

  const threadMessages =
    activeConversationId && !messagesQuery.isError
      ? messagesQuery.messages
      : freshChatOptimisticMessage
        ? [freshChatOptimisticMessage]
        : []

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
            <Badge variant="secondary">{badgeLabel}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 py-6">
          {!activeConversationId && !freshChatOptimisticMessage ? (
            <FreshChatState onSuggestionClick={handleSuggestionClick} />
          ) : activeConversationId && messagesQuery.isPending ? (
            <ChatWorkspaceLoading />
          ) : activeConversationId && messagesQuery.isError ? (
            <ChatWorkspaceError onRetry={() => void messagesQuery.refetch()} />
          ) : (
            <ChatThread
              className="min-h-[20rem] flex-1"
              conversationId={activeConversationId ?? MULTI_AGENT_FRESH_CHAT_KEY}
              messages={threadMessages}
            />
          )}

          <ComposerPanel
            draft={draft}
            isSubmitting={isSubmitting}
            onDraftChange={(value) => setComposerDraft(activeConversationId, value)}
            onSubmit={(text) => void handleSubmitPrompt(text)}
          />
        </CardContent>
      </Card>
    </main>
  )
}
