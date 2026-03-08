import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import { Message, MessageContent, MessageResponse } from "@/components/ai/message"
import type { MultiAgentMessageRecord } from "@/features/multi-agent/types/chat-workspace.types"
import { cn } from "@/lib/utils"

type ChatThreadProps = {
  className?: string
  conversationId: string
  messages: MultiAgentMessageRecord[]
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

export const ChatThread = ({ className, conversationId, messages }: ChatThreadProps) => {
  const orderedMessages = [...messages].sort(byChronologicalOrder)

  return (
    <Conversation
      className={cn("h-full rounded-lg border bg-muted/10", className)}
      key={conversationId}
    >
      <ConversationContent className="gap-4">
        {orderedMessages.length === 0 ? (
          <ConversationEmptyState
            className="min-h-[14rem] items-start justify-center text-left"
            description="Send the first prompt below to start this conversation."
            title="No messages in this conversation yet"
          />
        ) : (
          orderedMessages.map((message) => (
            <Message from={toMessageAuthor(message.role)} key={message.id}>
              <MessageContent>
                <MessageResponse>{message.content}</MessageResponse>
              </MessageContent>
            </Message>
          ))
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
