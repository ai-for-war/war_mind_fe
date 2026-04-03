import type { ConversationListParams } from "@/features/super-agent/types/conversation.types"

const SUPER_AGENT_QUERY_KEY = ["super-agent"] as const
const SUPER_AGENT_CONVERSATIONS_QUERY_KEY = [
  ...SUPER_AGENT_QUERY_KEY,
  "conversations",
] as const
const SUPER_AGENT_MESSAGES_QUERY_KEY = [...SUPER_AGENT_QUERY_KEY, "messages"] as const

export const superAgentQueryKeys = {
  all: SUPER_AGENT_QUERY_KEY,
  conversationMessages: (conversationId: string) =>
    [...SUPER_AGENT_MESSAGES_QUERY_KEY, conversationId] as const,
  conversationMessagesPlaceholder: [...SUPER_AGENT_MESSAGES_QUERY_KEY, "placeholder"] as const,
  conversationsAll: SUPER_AGENT_CONVERSATIONS_QUERY_KEY,
  conversationsList: ({ limit, search, skip, status }: ConversationListParams) =>
    [...SUPER_AGENT_CONVERSATIONS_QUERY_KEY, { limit, search, skip, status }] as const,
}
