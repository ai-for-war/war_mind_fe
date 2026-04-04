import { AlertCircle, RefreshCw, Sparkles } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useState } from "react"

import { ConversationEmptyState } from "@/components/ai/conversation"
import { ChatWorkspaceStatus } from "@/components/ai/chat-workspace-status"
import { AiMessageMetadataInspector } from "@/components/ai/message-metadata-inspector"
import { Suggestion } from "@/components/ai/suggestion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatThread } from "@/features/multi-agent/components/chat-thread"
import { ComposerPanel } from "@/features/multi-agent/components/composer-panel"
import { useChatLifecycleSubscriptions } from "@/features/multi-agent/hooks/use-chat-lifecycle-subscriptions"
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
import { normalizeAssistantMessageMetadata } from "@/lib/ai-message-metadata"
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

const DESKTOP_METADATA_INSPECTOR_BREAKPOINT = "(min-width: 1280px)"
const DESKTOP_METADATA_INSPECTOR_WIDTH = "clamp(18rem, 24vw, 22rem)"

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
    title="Start a fresh multi-agent chat"
  >
    <div className="w-full space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium text-sm">Start a fresh multi-agent chat</h3>
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
  const streamingAssistantByConversation = useMultiAgentChatWorkspaceStore(
    (state) => state.streamingAssistantByConversation,
  )
  const setComposerDraft = useMultiAgentChatWorkspaceStore((state) => state.setComposerDraft)
  const setRunStatus = useMultiAgentChatWorkspaceStore((state) => state.setRunStatus)
  const setThreadError = useMultiAgentChatWorkspaceStore((state) => state.setThreadError)
  const threadErrorByConversation = useMultiAgentChatWorkspaceStore(
    (state) => state.threadErrorByConversation,
  )

  const [freshChatOptimisticMessage, setFreshChatOptimisticMessage] =
    useState<MultiAgentMessageRecord | null>(null)
  const [isDesktopMetadataInspector, setIsDesktopMetadataInspector] = useState(false)
  const [isMetadataSheetOpen, setMetadataSheetOpen] = useState(false)
  const [selectedMetadataMessage, setSelectedMetadataMessage] =
    useState<MultiAgentMessageRecord | null>(null)
  const messagesQuery = useConversationMessages(activeConversationId)
  const sendMessageMutation = useSendMessage()
  useChatLifecycleSubscriptions({ activeConversationId })

  const conversationKey = toMultiAgentConversationKey(activeConversationId)
  const draft = composerDraftByConversation[conversationKey] ?? ""
  const runStatus = (runStatusByConversation[conversationKey] ?? "idle") satisfies MultiAgentRunStatus
  const isSubmitting = runStatus === "submitting"

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQuery = window.matchMedia(DESKTOP_METADATA_INSPECTOR_BREAKPOINT)
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktopMetadataInspector(event.matches)
    }

    handleChange(mediaQuery)
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

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
  const activeThreadError = threadErrorByConversation[conversationKey] ?? null
  const activeThreadMessageIds = new Set(threadMessages.map((message) => message.id))
  const activeSelectedMetadataMessage =
    selectedMetadataMessage && activeThreadMessageIds.has(selectedMetadataMessage.id)
      ? selectedMetadataMessage
      : null
  const selectedMetadata = activeSelectedMetadataMessage
    ? normalizeAssistantMessageMetadata(activeSelectedMetadataMessage.metadata)
    : null

  const handleOpenMetadata = (message: MultiAgentMessageRecord) => {
    const isSameMessage = activeSelectedMetadataMessage?.id === message.id
    const nextMessage = isSameMessage ? null : message

    setSelectedMetadataMessage(nextMessage)
    setMetadataSheetOpen(!isSameMessage)
  }

  return (
    <main className={cn("flex min-h-0 min-w-0 flex-1", className)}>
      <Card className="flex h-[calc(100dvh-6rem)] min-h-[34rem] min-w-0 w-full max-h-[calc(100dvh-6rem)] flex-col gap-0 overflow-hidden pb-0">
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
          <div className="flex min-h-0 min-w-0 flex-1 gap-2 overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {!activeConversationId && !freshChatOptimisticMessage ? (
                <FreshChatState onSuggestionClick={handleSuggestionClick} />
              ) : activeConversationId && messagesQuery.isPending ? (
                <ChatWorkspaceLoading />
              ) : activeConversationId && messagesQuery.isError ? (
                <ChatWorkspaceError onRetry={() => void messagesQuery.refetch()} />
              ) : (
                <ChatThread
                  className="min-h-0 flex-1"
                  conversationId={activeConversationId ?? MULTI_AGENT_FRESH_CHAT_KEY}
                  messages={threadMessages}
                  onOpenMetadata={handleOpenMetadata}
                  runStatus={runStatus}
                  streamingAssistant={activeStreamingAssistant}
                  threadError={activeThreadError}
                />
              )}
            </div>

            <div className="hidden min-h-0 shrink-0 xl:block">
              <motion.div
                animate={{
                  width: selectedMetadata ? DESKTOP_METADATA_INSPECTOR_WIDTH : 0,
                  x: selectedMetadata ? 0 : 24,
                }}
                className="h-full overflow-hidden"
                initial={false}
                transition={{ type: "tween", duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="h-full"
                  style={{ width: DESKTOP_METADATA_INSPECTOR_WIDTH }}
                >
                  {selectedMetadata ? (
                    <AiMessageMetadataInspector
                      className="border-border/60"
                      metadata={selectedMetadata}
                    />
                  ) : null}
                </div>
              </motion.div>
            </div>
          </div>

          <ComposerPanel
            // className="mt-1"
            draft={draft}
            isSubmitting={isSubmitting}
            onDraftChange={(value) => setComposerDraft(activeConversationId, value)}
            onSubmit={(text) => void handleSubmitPrompt(text)}
          />
        </CardContent>
      </Card>

      <Sheet
        open={Boolean(selectedMetadata) && isMetadataSheetOpen && !isDesktopMetadataInspector}
        onOpenChange={setMetadataSheetOpen}
      >
        <SheetContent className="w-full max-w-[24rem] p-0 sm:max-w-[24rem]" side="right">
          <SheetTitle className="sr-only">Assistant message metadata</SheetTitle>
          <SheetDescription className="sr-only">
            Inspect the model, skill, and tools used for the selected assistant response.
          </SheetDescription>
          {selectedMetadata ? (
            <AiMessageMetadataInspector className="h-full rounded-none border-0 shadow-none" metadata={selectedMetadata} />
          ) : null}
        </SheetContent>
      </Sheet>
    </main>
  )
}
