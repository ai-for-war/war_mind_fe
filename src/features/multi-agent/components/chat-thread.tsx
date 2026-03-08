import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai/message"
import type {
  MultiAgentMessageRecord,
  MultiAgentStreamingAssistantState,
} from "@/features/multi-agent/types/chat-workspace.types"
import { cn } from "@/lib/utils"

type ChatThreadProps = {
  className?: string
  conversationId: string
  messages: MultiAgentMessageRecord[]
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
  streamingAssistant,
  threadError,
}: ChatThreadProps) => {
  const orderedMessages = [...messages].sort(byChronologicalOrder)
  const hasStreamingAssistant = Boolean(streamingAssistant)
  const hasMessages = orderedMessages.length > 0 || hasStreamingAssistant

  return (
    <Conversation
      className={cn("h-full rounded-lg border bg-muted/10", className)}
      key={conversationId}
    >
      <ConversationContent className="gap-4">
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
                <MessageContent>
                  <MessageResponse>{message.content}</MessageResponse>
                </MessageContent>
              </Message>
            ))}

            {streamingAssistant ? (
              <Message from="assistant" key={`streaming-${conversationId}`}>
                <MessageContent>
                  <MessageResponse>
                    {streamingAssistant.content || "Thinking..."}
                  </MessageResponse>
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
