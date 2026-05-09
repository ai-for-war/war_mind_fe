import { Menu, RefreshCw, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { Suggestion } from "@/components/ai/suggestion"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { StockAgentChatThread } from "@/features/stock-agent/components/chat-thread"
import { StockAgentComposerPanel } from "@/features/stock-agent/components/stock-agent-composer-panel"
import { StockAgentConversationRail } from "@/features/stock-agent/components/conversation-rail"
import { useStockAgentChatLifecycleSubscriptions } from "@/features/stock-agent/hooks/use-chat-lifecycle-subscriptions"
import { useStockAgentConversationMessages } from "@/features/stock-agent/hooks/use-conversation-messages"
import { useStockAgentRuntimeCatalog } from "@/features/stock-agent/hooks/use-stock-agent-runtime-catalog"
import { useStockAgentSendMessage } from "@/features/stock-agent/hooks/use-send-message"
import {
  STOCK_AGENT_FRESH_CHAT_KEY,
  toStockAgentConversationKey,
  useStockAgentChatWorkspaceStore,
} from "@/features/stock-agent/stores/use-stock-agent-chat-workspace-store"
import { useStockAgentRailStore } from "@/features/stock-agent/stores/use-stock-agent-rail-store"
import type { StockAgentMessageRecord, StockAgentRunStatus } from "@/features/stock-agent/types"
import { resolveStockAgentRuntimeSelection } from "@/features/stock-agent/utils/runtime-catalog"
import { cn } from "@/lib/utils"

const FRESH_CHAT_SUGGESTIONS = [
  "Analyze VNM quickly",
  "Compare FPT and MWG",
  "Explain banking stock risks",
  "Create a stock entry checklist",
]

type StockAgentChatWorkspaceProps = {
  className?: string
  isMobile?: boolean
}

const StockAgentChatLoading = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-16 w-4/5" />
    <Skeleton className="ml-auto h-12 w-2/3" />
    <Skeleton className="h-20 w-5/6" />
  </div>
)

type StockAgentChatErrorProps = {
  onRetry: () => void
}

const StockAgentChatError = ({ onRetry }: StockAgentChatErrorProps) => (
  <div className="flex min-h-0 flex-1 items-start p-4">
    <div className="flex w-full flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
      <p className="text-sm font-medium">Unable to load this stock-agent conversation.</p>
      <p className="text-xs text-destructive/90">Retry to fetch message history.</p>
      <Button onClick={onRetry} size="sm" type="button" variant="outline">
        <RefreshCw className="size-4" />
        Retry
      </Button>
    </div>
  </div>
)

type StockAgentFreshChatStateProps = {
  onSuggestionClick: (value: string) => void
}

const StockAgentFreshChatState = ({ onSuggestionClick }: StockAgentFreshChatStateProps) => (
  <Empty className="min-h-0 flex-1 border-0 bg-muted/10 p-6">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Sparkles className="size-5" />
      </EmptyMedia>
      <EmptyTitle>Start a stock-agent chat</EmptyTitle>
      <EmptyDescription>
        Choose a prompt or ask a market question directly. No page context is attached.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent className="max-w-none">
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {FRESH_CHAT_SUGGESTIONS.map((suggestion) => (
          <Suggestion
            className="h-auto w-full max-w-full justify-start whitespace-normal py-2 text-left break-words"
            key={suggestion}
            onClick={onSuggestionClick}
            suggestion={suggestion}
            variant="secondary"
          />
        ))}
      </div>
    </EmptyContent>
  </Empty>
)

const resolveErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return "Failed to submit prompt. Please try again."
}

const createOptimisticFreshMessage = (content: string): StockAgentMessageRecord => ({
  attachments: null,
  content,
  conversation_id: STOCK_AGENT_FRESH_CHAT_KEY,
  created_at: new Date().toISOString(),
  id: `optimistic-fresh-${Date.now()}`,
  is_complete: true,
  metadata: { optimistic: true },
  role: "user",
})

export const StockAgentChatWorkspace = ({
  className,
  isMobile = false,
}: StockAgentChatWorkspaceProps) => {
  const activeConversationId = useStockAgentRailStore((state) => state.activeConversationId)
  const isMobileConversationListOpen = useStockAgentRailStore(
    (state) => state.isMobileConversationListOpen,
  )
  const setActiveConversationId = useStockAgentRailStore((state) => state.setActiveConversationId)
  const setMobileConversationListOpen = useStockAgentRailStore(
    (state) => state.setMobileConversationListOpen,
  )
  const clearActivityLine = useStockAgentChatWorkspaceStore((state) => state.clearActivityLine)
  const clearComposerDraft = useStockAgentChatWorkspaceStore((state) => state.clearComposerDraft)
  const clearComposerRuntimeNotice = useStockAgentChatWorkspaceStore(
    (state) => state.clearComposerRuntimeNotice,
  )
  const composerDraftByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.composerDraftByConversation,
  )
  const composerRuntimeNoticeByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.composerRuntimeNoticeByConversation,
  )
  const composerRuntimeSelectionByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.composerRuntimeSelectionByConversation,
  )
  const composerSubagentEnabledByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.composerSubagentEnabledByConversation,
  )
  const rekeyComposerRuntimeSelection = useStockAgentChatWorkspaceStore(
    (state) => state.rekeyComposerRuntimeSelection,
  )
  const rekeyComposerSubagentEnabled = useStockAgentChatWorkspaceStore(
    (state) => state.rekeyComposerSubagentEnabled,
  )
  const runStatusByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.runStatusByConversation,
  )
  const setComposerDraft = useStockAgentChatWorkspaceStore((state) => state.setComposerDraft)
  const setComposerRuntimeModel = useStockAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeModel,
  )
  const setComposerRuntimeNotice = useStockAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeNotice,
  )
  const setComposerRuntimeReasoning = useStockAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeReasoning,
  )
  const setComposerRuntimeSelection = useStockAgentChatWorkspaceStore(
    (state) => state.setComposerRuntimeSelection,
  )
  const setComposerSubagentEnabled = useStockAgentChatWorkspaceStore(
    (state) => state.setComposerSubagentEnabled,
  )
  const setRunStatus = useStockAgentChatWorkspaceStore((state) => state.setRunStatus)
  const setThreadError = useStockAgentChatWorkspaceStore((state) => state.setThreadError)
  const streamingAssistantByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.streamingAssistantByConversation,
  )
  const threadErrorByConversation = useStockAgentChatWorkspaceStore(
    (state) => state.threadErrorByConversation,
  )

  const [freshChatOptimisticMessage, setFreshChatOptimisticMessage] =
    useState<StockAgentMessageRecord | null>(null)
  const messagesQuery = useStockAgentConversationMessages(activeConversationId)
  const runtimeCatalogQuery = useStockAgentRuntimeCatalog()
  const sendMessageMutation = useStockAgentSendMessage()
  useStockAgentChatLifecycleSubscriptions({ activeConversationId })

  const conversationKey = toStockAgentConversationKey(activeConversationId)
  const draft = composerDraftByConversation[conversationKey] ?? ""
  const runtimeNotice = composerRuntimeNoticeByConversation[conversationKey] ?? null
  const activeRuntimeSelection = composerRuntimeSelectionByConversation[conversationKey] ?? null
  const isSubagentEnabled = composerSubagentEnabledByConversation[conversationKey] ?? false
  const runStatus = (runStatusByConversation[conversationKey] ?? "idle") satisfies StockAgentRunStatus
  const isSubmitting = runStatus === "submitting"
  const activeStreamingAssistant = activeConversationId
    ? streamingAssistantByConversation[activeConversationId] ?? null
    : null
  const activeThreadError = threadErrorByConversation[conversationKey] ?? null

  const resolvedRuntime = runtimeCatalogQuery.catalog
    ? resolveStockAgentRuntimeSelection(runtimeCatalogQuery.catalog, activeRuntimeSelection)
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

    const result = resolveStockAgentRuntimeSelection(
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
      setThreadError(submitKey, "Unable to load a valid stock-agent runtime. Please retry.")
      return
    }

    clearActivityLine(submitKey)
    setRunStatus(submitKey, "submitting")
    setThreadError(submitKey, null)

    if (!activeConversationId) {
      setFreshChatOptimisticMessage(createOptimisticFreshMessage(prompt))
    }

    try {
      const result = await sendMessageMutation.mutateAsync({
        content: prompt,
        conversation_id: activeConversationId,
        subagent_enabled: isSubagentEnabled,
        ...normalizedRuntime.runtime,
      })

      clearComposerDraft(activeConversationId)

      if (!activeConversationId) {
        setFreshChatOptimisticMessage(null)
        rekeyComposerRuntimeSelection(null, result.conversation_id)
        rekeyComposerSubagentEnabled(null, result.conversation_id)
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

  return (
    <main className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
        <div className="flex min-w-0 items-center gap-2">
          {isMobile ? (
            <Button
              aria-label="Open stock-agent conversations"
              onClick={() => setMobileConversationListOpen(true)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <Menu className="size-4" />
            </Button>
          ) : null}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">
              {activeConversationId ? "Stock conversation" : "New stock chat"}
            </h3>
            <p className="truncate text-xs text-muted-foreground">Stock Agent</p>
          </div>
        </div>
        {runtimeNotice ? (
          <p className="hidden max-w-[20rem] truncate text-xs text-muted-foreground lg:block">
            {runtimeNotice}
          </p>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!activeConversationId && !freshChatOptimisticMessage ? (
          <StockAgentFreshChatState onSuggestionClick={handleSuggestionClick} />
        ) : activeConversationId && messagesQuery.isPending ? (
          <StockAgentChatLoading />
        ) : activeConversationId && messagesQuery.isError ? (
          <StockAgentChatError onRetry={() => void messagesQuery.refetch()} />
        ) : (
          <StockAgentChatThread
            className="min-h-0 flex-1"
            conversationId={activeConversationId ?? STOCK_AGENT_FRESH_CHAT_KEY}
            messages={threadMessages}
            runStatus={runStatus}
            streamingAssistant={activeStreamingAssistant}
            threadError={activeThreadError}
          />
        )}
      </div>

      <StockAgentComposerPanel
        catalog={runtimeCatalogQuery.catalog}
        draft={draft}
        isRuntimeLoading={runtimeCatalogQuery.isPending}
        isRuntimeReady={isRuntimeReady}
        isRuntimeRetrying={runtimeCatalogQuery.isRefetching}
        isSubmitting={isSubmitting}
        isSubagentEnabled={isSubagentEnabled}
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
        onSubagentEnabledChange={(checked) =>
          setComposerSubagentEnabled(activeConversationId, checked)
        }
        onSubmit={(text) => void handleSubmitPrompt(text)}
        runtimeError={runtimeError}
        runtimeSelection={activeRuntimeSelection}
      />

      {isMobile ? (
        <Sheet
          onOpenChange={setMobileConversationListOpen}
          open={isMobileConversationListOpen}
        >
          <SheetContent className="w-full max-w-[22rem] p-0" side="left">
            <SheetTitle className="sr-only">Stock Agent conversations</SheetTitle>
            <SheetDescription className="sr-only">
              Browse and switch Stock Agent conversations.
            </SheetDescription>
            <StockAgentConversationRail
              className="h-full"
              onConversationSelected={() => setMobileConversationListOpen(false)}
              onNewChat={() => setMobileConversationListOpen(false)}
            />
          </SheetContent>
        </Sheet>
      ) : null}
    </main>
  )
}
