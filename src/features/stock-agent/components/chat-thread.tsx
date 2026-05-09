import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import { AssistantMessagePlaceholder } from "@/components/ai/assistant-message-placeholder"
import { Actions, CopyAction } from "@/components/ai/actions"
import { Message, MessageContent, MessageResponse } from "@/components/ai/message"
import { StockAgentActivityLine } from "@/features/stock-agent/components/stock-agent-activity-line"
import type {
  StockAgentActivityLineState,
  StockAgentMessageRecord,
  StockAgentRunStatus,
  StockAgentStreamingAssistantState,
} from "@/features/stock-agent/types"
import { cn } from "@/lib/utils"

type StockAgentChatThreadProps = {
  activity: StockAgentActivityLineState | null
  className?: string
  conversationId: string
  messages: StockAgentMessageRecord[]
  runStatus: StockAgentRunStatus
  streamingAssistant: StockAgentStreamingAssistantState | null
  threadError: string | null
}

const toMessageAuthor = (role: StockAgentMessageRecord["role"]): "assistant" | "user" =>
  role === "user" ? "user" : "assistant"

const byChronologicalOrder = (
  left: StockAgentMessageRecord,
  right: StockAgentMessageRecord,
): number => {
  const leftTime = Date.parse(left.created_at)
  const rightTime = Date.parse(right.created_at)

  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return 0
  }

  return leftTime - rightTime
}

export const StockAgentChatThread = ({
  activity,
  className,
  conversationId,
  messages,
  runStatus,
  streamingAssistant,
  threadError,
}: StockAgentChatThreadProps) => {
  const orderedMessages = [...messages].sort(byChronologicalOrder)
  const hasStreamingAssistant = Boolean(streamingAssistant)
  const visibleActivity = activity
  const placeholderStage =
    streamingAssistant && !streamingAssistant.content
      ? "streaming"
      : !streamingAssistant && runStatus === "submitting"
        ? "submitting"
        : null
  const hasMessages = orderedMessages.length > 0 || hasStreamingAssistant || Boolean(visibleActivity)

  return (
    <Conversation
      className={cn("h-full min-h-0 overflow-hidden bg-muted/10", className)}
      key={conversationId}
    >
      <ConversationContent className="gap-4 p-4">
        {!hasMessages ? (
          <ConversationEmptyState
            className="min-h-[14rem] items-start justify-center text-left"
            description="Send the first prompt below to start this stock-agent conversation."
            title="No messages in this conversation yet"
          />
        ) : (
          <>
            {orderedMessages.map((message) => (
              <Message from={toMessageAuthor(message.role)} key={message.id}>
                <MessageContent
                  className={cn(
                    "rounded-lg p-4",
                    toMessageAuthor(message.role) === "assistant"
                      ? "bg-primary/10"
                      : "bg-secondary",
                  )}
                >
                  <MessageResponse>{message.content}</MessageResponse>
                </MessageContent>
                <Actions
                  className={cn(
                    "opacity-0 transition-opacity group-hover:opacity-100",
                    toMessageAuthor(message.role) === "user" ? "ml-auto" : undefined,
                  )}
                >
                  <CopyAction text={message.content} />
                </Actions>
              </Message>
            ))}

            {visibleActivity ? (
              <Message from="assistant" key={`activity-${conversationId}`}>
                <MessageContent className="w-full rounded-lg bg-transparent p-0">
                  <StockAgentActivityLine activity={visibleActivity} />
                </MessageContent>
              </Message>
            ) : null}

            {streamingAssistant ? (
              <Message from="assistant" key={`streaming-${conversationId}`}>
                <MessageContent className="rounded-lg bg-primary/10 p-4">
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
                <MessageContent className="rounded-lg bg-primary/10 p-4">
                  <AssistantMessagePlaceholder />
                </MessageContent>
              </Message>
            ) : null}
          </>
        )}

        {threadError ? (
          <div
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {threadError}
          </div>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
