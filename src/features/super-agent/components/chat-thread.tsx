import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai/message"
import type {
  SuperAgentInlineActivityTrace,
  SuperAgentMessageRecord,
  SuperAgentStreamingAssistantState,
} from "@/features/super-agent/types/chat-workspace.types"
import { cn } from "@/lib/utils"

import { SuperAgentActivityBlock } from "./super-agent-activity-block"

type ChatThreadProps = {
  activityTrace: SuperAgentInlineActivityTrace | null
  className?: string
  conversationId: string
  messages: SuperAgentMessageRecord[]
  streamingAssistant: SuperAgentStreamingAssistantState | null
  threadError: string | null
}

const toMessageAuthor = (role: SuperAgentMessageRecord["role"]): "assistant" | "user" =>
  role === "user" ? "user" : "assistant"

const byChronologicalOrder = (a: SuperAgentMessageRecord, b: SuperAgentMessageRecord): number => {
  const aTime = Date.parse(a.created_at)
  const bTime = Date.parse(b.created_at)

  if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
    return 0
  }

  return aTime - bTime
}

export const ChatThread = ({
  activityTrace,
  className,
  conversationId,
  messages,
  streamingAssistant,
  threadError,
}: ChatThreadProps) => {
  const orderedMessages = [...messages].sort(byChronologicalOrder)
  const hasStreamingAssistant = Boolean(streamingAssistant)
  const hasActivityTrace = Boolean(activityTrace && activityTrace.steps.length > 0)
  const lastAssistantMessageId =
    [...orderedMessages].reverse().find((message) => toMessageAuthor(message.role) === "assistant")?.id ??
    null
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
                  {!hasStreamingAssistant &&
                  hasActivityTrace &&
                  message.id === lastAssistantMessageId &&
                  toMessageAuthor(message.role) === "assistant" ? (
                    <SuperAgentActivityBlock className="mb-3" trace={activityTrace} />
                  ) : null}
                  <MessageResponse>{message.content}</MessageResponse>
                </MessageContent>
              </Message>
            ))}

            {streamingAssistant ? (
              <Message from="assistant" key={`streaming-${conversationId}`}>
                <MessageContent className="bg-primary/10 p-5 rounded-lg">
                  {hasActivityTrace ? (
                    <SuperAgentActivityBlock className="mb-3" trace={activityTrace} />
                  ) : null}
                  {streamingAssistant.content ? (
                    <MessageResponse>{streamingAssistant.content}</MessageResponse>
                  ) : null}
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
