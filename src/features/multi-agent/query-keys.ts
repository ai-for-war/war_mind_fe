import type { ConversationListParams } from "@/features/multi-agent/types/conversation.types"

const MULTI_AGENT_QUERY_KEY = ["multi-agent"] as const
const MULTI_AGENT_CONVERSATIONS_QUERY_KEY = [
  ...MULTI_AGENT_QUERY_KEY,
  "conversations",
] as const
const MULTI_AGENT_MESSAGES_QUERY_KEY = [...MULTI_AGENT_QUERY_KEY, "messages"] as const

export const multiAgentQueryKeys = {
  all: MULTI_AGENT_QUERY_KEY,
  conversationMessages: (conversationId: string) =>
    [...MULTI_AGENT_MESSAGES_QUERY_KEY, conversationId] as const,
  conversationMessagesPlaceholder: [...MULTI_AGENT_MESSAGES_QUERY_KEY, "placeholder"] as const,
  conversationsAll: MULTI_AGENT_CONVERSATIONS_QUERY_KEY,
  conversationsList: ({ limit, search, skip, status }: ConversationListParams) =>
    [...MULTI_AGENT_CONVERSATIONS_QUERY_KEY, { limit, search, skip, status }] as const,
}
