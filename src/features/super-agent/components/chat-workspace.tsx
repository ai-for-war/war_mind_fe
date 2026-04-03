import { AlertCircle, RefreshCw, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { ConversationEmptyState } from "@/components/ai/conversation"
import { ChatWorkspaceStatus } from "@/components/ai/chat-workspace-status"
import { Suggestion } from "@/components/ai/suggestion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatThread } from "@/features/super-agent/components/chat-thread"
import { ComposerPanel } from "@/features/super-agent/components/composer-panel"
import { useChatLifecycleSubscriptions } from "@/features/super-agent/hooks/use-chat-lifecycle-subscriptions"
import { useConversationMessages } from "@/features/super-agent/hooks/use-conversation-messages"
import { useLeadAgentRuntimeCatalog } from "@/features/super-agent/hooks/use-lead-agent-runtime-catalog"
import { useSendMessage } from "@/features/super-agent/hooks/use-send-message"
import {
  SUPER_AGENT_FRESH_CHAT_KEY,
  toSuperAgentConversationKey,
  useSuperAgentChatWorkspaceStore,
} from "@/features/super-agent/stores/use-super-agent-chat-workspace-store"
import { useSuperAgentRailStore } from "@/features/super-agent/stores/use-super-agent-rail-store"
import type {
  SuperAgentInlineActivityTrace,
  SuperAgentMessageRecord,
  SuperAgentRunStatus,
} from "@/features/super-agent/types/chat-workspace.types"
import {
  resolveSuperAgentRuntimeSelection,
} from "@/features/super-agent/utils/runtime-catalog"
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
  <div className="flex h-full min-h-0 flex-1 flex-col rounded-lg border border-border/60 p-6">
    <div className="space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-2">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  </div>
)

type ChatWorkspaceErrorProps = {
  onRetry: () => void
}

const ChatWorkspaceError = ({ onRetry }: ChatWorkspaceErrorProps) => (
  <div
    role="alert"
    className="flex min-h-0 flex-1 flex-col rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive"
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
    className="flex min-h-0 flex-1 items-start rounded-lg border border-dashed bg-muted/20 p-6 text-left"
    description="Choose a suggestion to prefill your first prompt, or start typing in the composer."
    icon={<Sparkles className="size-5" />}
    title="Start a fresh super-agent chat"
  >
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium text-sm">Start a fresh super-agent chat</h3>
        <p className="text-muted-foreground text-sm">
          Choose a suggestion to prefill your first prompt, or start typing in the composer.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
        {FRESH_CHAT_SUGGESTIONS.map((suggestion) => (
          <Suggestion
            key={suggestion}
            className="h-auto w-full max-w-full justify-start whitespace-normal py-2 text-left break-words"
            onClick={onSuggestionClick}
            suggestion={suggestion}
            variant="secondary"
          />
        ))}
      </div>
    </div>
  </ConversationEmptyState>
)

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return "Failed to submit prompt. Please try again."
}

const createOptimisticFreshMessage = (content: string): SuperAgentMessageRecord => ({
  attachments: null,
  content,
  conversation_id: SUPER_AGENT_FRESH_CHAT_KEY,
  created_at: new Date().toISOString(),
  id: `optimistic-fresh-${Date.now()}`,
  is_complete: true,
  metadata: { optimistic: true },
  role: "user",
})

export const ChatWorkspace = ({ className }: ChatWorkspaceProps) => {
  const activeConversationId = useSuperAgentRailStore((state) => state.activeConversationId)
  const setActiveConversationId = useSuperAgentRailStore((state) => state.setActiveConversationId)
  const clearComposerDraft = useSuperAgentChatWorkspaceStore((state) => state.clearComposerDraft)
  const clearComposerRuntimeNotice = useSuperAgentChatWorkspaceStore(
    (state) => state.clearComposerRuntimeNotice,
  )
  const composerDraftByConversation = useSuperAgentChatWorkspaceStore(
    (state) => state.composerDraftByConversation,
  )
  const composerRuntimeNoticeByConversation = useSuperAgentChatWorkspaceStore(
    (state) => state.composerRuntimeNoticeByConversation,
  )
  const composerRuntimeSelectionByConversation = useSuperAgentChatWorkspaceStore(
    (state) => state.composerRuntimeSelectionByConversation,
  )
  const activityTraceByConversation = useSuperAgentChatWorkspaceStore(
    (state) => state.activityTraceByConversation,
  )
  const rekeyComposerRuntimeSelection = useSuperAgentChatWorkspaceStore(
    (state) => state.rekeyComposerRuntimeSelection,
  )
  const runStatusByConversation = useSuperAgentChatWorkspaceStore(
    (state) => state.runStatusByConversation,
  )
  const setComposerRuntimeNotice = useSuperAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeNotice,
  )
  const setComposerRuntimeModel = useSuperAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeModel,
  )
  const setComposerRuntimeReasoning = useSuperAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeReasoning,
  )
  const setComposerRuntimeSelection = useSuperAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeSelection,
  )
  const streamingAssistantByConversation = useSuperAgentChatWorkspaceStore(
    (state) => state.streamingAssistantByConversation,
  )
  const setComposerDraft = useSuperAgentChatWorkspaceStore((state) => state.setComposerDraft)
  const setRunStatus = useSuperAgentChatWorkspaceStore((state) => state.setRunStatus)
  const setThreadError = useSuperAgentChatWorkspaceStore((state) => state.setThreadError)
  const threadErrorByConversation = useSuperAgentChatWorkspaceStore(
    (state) => state.threadErrorByConversation,
  )

  const [freshChatOptimisticMessage, setFreshChatOptimisticMessage] =
    useState<SuperAgentMessageRecord | null>(null)
  const messagesQuery = useConversationMessages(activeConversationId)
  const runtimeCatalogQuery = useLeadAgentRuntimeCatalog()
  const sendMessageMutation = useSendMessage()
  useChatLifecycleSubscriptions({ activeConversationId })

  const conversationKey = toSuperAgentConversationKey(activeConversationId)
  const draft = composerDraftByConversation[conversationKey] ?? ""
  const runtimeNotice = composerRuntimeNoticeByConversation[conversationKey] ?? null
  const activeRuntimeSelection = composerRuntimeSelectionByConversation[conversationKey] ?? null
  const runStatus = (runStatusByConversation[conversationKey] ?? "idle") satisfies SuperAgentRunStatus
  const isSubmitting = runStatus === "submitting"

  const resolvedRuntime = runtimeCatalogQuery.catalog
    ? resolveSuperAgentRuntimeSelection(runtimeCatalogQuery.catalog, activeRuntimeSelection)
    : null
  const normalizedRuntime = resolvedRuntime?.normalized ?? null
  const runtimeError = runtimeCatalogQuery.isError
    ? "Runtime catalog unavailable. Retry and try again."
    : !runtimeCatalogQuery.catalog
      ? "Loading runtime catalog."
      : !normalizedRuntime
        ? "Choose a valid runtime before sending."
        : null
  const isRuntimeReady = Boolean(normalizedRuntime)

  useEffect(() => {
    if (!runtimeCatalogQuery.catalog) {
      return
    }

    const result = resolveSuperAgentRuntimeSelection(
      runtimeCatalogQuery.catalog,
      activeRuntimeSelection,
    )

    if (!result.nextSelection) {
      return
    }

    if (
      !activeRuntimeSelection ||
      result.changed ||
      activeRuntimeSelection.provider !== result.nextSelection.provider ||
      activeRuntimeSelection.model !== result.nextSelection.model ||
      activeRuntimeSelection.reasoning !== result.nextSelection.reasoning
    ) {
      setComposerRuntimeSelection(activeConversationId, result.nextSelection)
    }

    if (activeRuntimeSelection && result.changed) {
      setComposerRuntimeNotice(
        activeConversationId,
        "Your previous runtime is no longer available. We switched to the latest supported default.",
      )
    } else if (!activeRuntimeSelection) {
      clearComposerRuntimeNotice(activeConversationId)
    }
  }, [
    activeConversationId,
    activeRuntimeSelection,
    clearComposerRuntimeNotice,
    runtimeCatalogQuery.catalog,
    setComposerRuntimeNotice,
    setComposerRuntimeSelection,
  ])

  const handleSuggestionClick = (value: string) => {
    setComposerDraft(null, value)
  }

  const handleSubmitPrompt = async (inputText: string) => {
    const prompt = inputText.trim()
    if (prompt.length === 0) {
      return
    }

    const submitKey = conversationKey
    if (!normalizedRuntime) {
      setRunStatus(submitKey, "failed")
      setThreadError(submitKey, "Unable to load a valid lead-agent runtime. Please retry.")
      return
    }

    setRunStatus(submitKey, "submitting")
    setThreadError(submitKey, null)

    if (!activeConversationId) {
      setFreshChatOptimisticMessage(createOptimisticFreshMessage(prompt))
    }

    try {
      const result = await sendMessageMutation.mutateAsync({
        content: prompt,
        conversation_id: activeConversationId,
        ...normalizedRuntime.runtime,
      })

      clearComposerDraft(activeConversationId)

      if (!activeConversationId) {
        setFreshChatOptimisticMessage(null)
        rekeyComposerRuntimeSelection(null, result.conversation_id)
        setRunStatus(result.conversation_id, "submitting")
        setThreadError(result.conversation_id, null)
        setRunStatus(submitKey, "idle")
        setThreadError(submitKey, null)
        setActiveConversationId(result.conversation_id)
      } else {
        setRunStatus(submitKey, "submitting")
        setThreadError(submitKey, null)
      }
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
  const activeStreamingAssistant = activeConversationId
    ? streamingAssistantByConversation[activeConversationId] ?? null
    : null
  const activeActivityTrace = activeConversationId
    ? (activityTraceByConversation[activeConversationId] ?? null)
    : null satisfies SuperAgentInlineActivityTrace | null
  const activeThreadError = threadErrorByConversation[conversationKey] ?? null

  return (
    <main className={cn("flex min-h-0 flex-1", className)}>
      <Card className="flex h-[calc(100dvh-6rem)]  min-h-[34rem] w-full max-h-[calc(100dvh-6rem)] flex-col gap-0 overflow-hidden pb-0">
        <CardHeader className="mb-2">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div className="space-y-1">
              <CardTitle>Chat Workspace</CardTitle>
              <CardDescription>
                {activeConversationId
                  ? "Review conversation context and continue from the composer."
                  : "No active conversation selected. Start a fresh chat from here."}
              </CardDescription>
            </div>
            <ChatWorkspaceStatus
              activeConversationId={activeConversationId}
              runStatus={runStatus}
            />
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-0">
          {!activeConversationId && !freshChatOptimisticMessage ? (
            <FreshChatState onSuggestionClick={handleSuggestionClick} />
          ) : activeConversationId && messagesQuery.isPending ? (
            <ChatWorkspaceLoading />
          ) : activeConversationId && messagesQuery.isError ? (
            <ChatWorkspaceError onRetry={() => void messagesQuery.refetch()} />
          ) : (
            <ChatThread
              className="min-h-0 flex-1"
              activityTrace={activeActivityTrace}
              conversationId={activeConversationId ?? SUPER_AGENT_FRESH_CHAT_KEY}
              messages={threadMessages}
              streamingAssistant={activeStreamingAssistant}
              threadError={activeThreadError}
            />
          )}

          {runtimeNotice ? (
            <div className="px-6">
              <Alert>
                <AlertDescription>{runtimeNotice}</AlertDescription>
              </Alert>
            </div>
          ) : null}

          <ComposerPanel
            catalog={runtimeCatalogQuery.catalog}
            draft={draft}
            isRuntimeLoading={runtimeCatalogQuery.isPending}
            isRuntimeReady={isRuntimeReady}
            isRuntimeRetrying={runtimeCatalogQuery.isRefetching}
            isSubmitting={isSubmitting}
            onDraftChange={(value) => setComposerDraft(activeConversationId, value)}
            onRetryRuntime={() => void runtimeCatalogQuery.refetchCatalog()}
            onSelectModel={({ model, provider }) => {
              if (!runtimeCatalogQuery.catalog) {
                return
              }

              setComposerRuntimeModel(activeConversationId, {
                catalog: runtimeCatalogQuery.catalog,
                model,
                provider,
              })
              clearComposerRuntimeNotice(activeConversationId)
            }}
            onSelectReasoning={(reasoning) => {
              setComposerRuntimeReasoning(activeConversationId, reasoning)
              clearComposerRuntimeNotice(activeConversationId)
            }}
            onSubmit={(text) => void handleSubmitPrompt(text)}
            runtimeError={runtimeError}
            runtimeSelection={activeRuntimeSelection}
          />
        </CardContent>
      </Card>
    </main>
  )
}
