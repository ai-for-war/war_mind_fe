import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import { AssistantMessagePlaceholder } from "@/components/ai/assistant-message-placeholder"
import { Actions, CopyAction, MetadataAction } from "@/components/ai/actions"
import { Message, MessageContent, MessageResponse } from "@/components/ai/message"
import type {
  MultiAgentMessageRecord,
  MultiAgentRunStatus,
  MultiAgentStreamingAssistantState,
} from "@/features/multi-agent/types/chat-workspace.types"
import { hasDisplayableAssistantMessageMetadata } from "@/lib/ai-message-metadata"
import { cn } from "@/lib/utils"

type ChatThreadProps = {
  className?: string
  conversationId: string
  messages: MultiAgentMessageRecord[]
  onOpenMetadata?: (message: MultiAgentMessageRecord) => void
  runStatus: MultiAgentRunStatus
  streamingAssistant: MultiAgentStreamingAssistantState | null
  threadError: string | null
}

const toMessageAuthor = (role: MultiAgentMessageRecord["role"]): "assistant" | "user" =>
  role === "user" ? "user" : "assistant"

const byChronologicalOrder = (a: MultiAgentMessageRecord, b: MultiAgentMessageRecord): number => {
  const aTime = Date.parse(a.created_at)
  const bTime = Date.parse(b.created_at)

  if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
    return 0
  }

  return aTime - bTime
}

export const ChatThread = ({
  className,
  conversationId,
  messages,
  onOpenMetadata,
  runStatus,
  streamingAssistant,
  threadError,
}: ChatThreadProps) => {
  const orderedMessages = [...messages].sort(byChronologicalOrder)
  const hasStreamingAssistant = Boolean(streamingAssistant)
  const placeholderStage =
    streamingAssistant && !streamingAssistant.content
      ? "streaming"
      : !streamingAssistant && runStatus === "submitting"
        ? "submitting"
        : null
  const hasMessages = orderedMessages.length > 0 || hasStreamingAssistant

  return (
    <Conversation
      className={cn("h-full min-h-0 overflow-hidden rounded-lg border bg-muted/10", className)}
      key={conversationId}
    >
      <ConversationContent className="gap-4 pb-4">
        {!hasMessages ? (
          <ConversationEmptyState
            className="min-h-[14rem] items-start justify-center text-left"
            description="Send the first prompt below to start this conversation."
            title="No messages in this conversation yet"
          />
        ) : (
          <>
            {orderedMessages.map((message) => (
              <Message from={toMessageAuthor(message.role)} key={message.id}>
                <MessageContent className="bg-primary/10 p-5 rounded-lg">
                  <MessageResponse>{message.content}</MessageResponse>
                </MessageContent>
                <Actions
                  className={cn(
                    "opacity-0 transition-opacity group-hover:opacity-100",
                    toMessageAuthor(message.role) === "user" ? "ml-auto" : undefined,
                  )}
                >
                  {toMessageAuthor(message.role) === "assistant" &&
                  hasDisplayableAssistantMessageMetadata(message.metadata) ? (
                    <MetadataAction onClick={() => onOpenMetadata?.(message)} />
                  ) : null}
                  <CopyAction text={message.content} />
                </Actions>
              </Message>
            ))}

            {streamingAssistant ? (
              <Message from="assistant" key={`streaming-${conversationId}`}>
                <MessageContent className="bg-primary/10 p-5 rounded-lg">
                  {streamingAssistant.content ? (
                    <MessageResponse>{streamingAssistant.content}</MessageResponse>
                  ) : (
                    <AssistantMessagePlaceholder />
                  )}
                </MessageContent>
                {streamingAssistant.content ? (
                  <Actions className="opacity-0 transition-opacity group-hover:opacity-100">
                    <CopyAction text={streamingAssistant.content} />
                  </Actions>
                ) : null}
              </Message>
            ) : null}

            {placeholderStage === "submitting" ? (
              <Message from="assistant" key={`pending-${conversationId}`}>
                <MessageContent className="bg-primary/10 p-5 rounded-lg">
                  <AssistantMessagePlaceholder />
                </MessageContent>
              </Message>
            ) : null}
          </>
        )}

        {threadError ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-xs"
          >
            {threadError}
          </div>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
