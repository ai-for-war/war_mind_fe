import type { ConversationListParams } from "@/features/multi-agent/types/conversation.types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const MULTI_AGENT_QUERY_KEY = ["multi-agent"] as const

export const multiAgentQueryKeys = {
  all: MULTI_AGENT_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [
      ...MULTI_AGENT_QUERY_KEY,
      "organization",
      getOrganizationQueryScope(organizationId),
    ] as const,
  conversationsAll: (organizationId?: string | null) =>
    [...multiAgentQueryKeys.scoped(organizationId), "conversations"] as const,
  conversationMessagesAll: (organizationId?: string | null) =>
    [...multiAgentQueryKeys.scoped(organizationId), "messages"] as const,
  conversationMessages: (
    organizationId: string | null | undefined,
    conversationId: string,
  ) => [...multiAgentQueryKeys.conversationMessagesAll(organizationId), conversationId] as const,
  conversationMessagesPlaceholder: (organizationId?: string | null) =>
    [...multiAgentQueryKeys.conversationMessagesAll(organizationId), "placeholder"] as const,
  conversationsList: (
    organizationId: string | null | undefined,
    { limit, search, skip, status }: ConversationListParams,
  ) =>
    [...multiAgentQueryKeys.conversationsAll(organizationId), { limit, search, skip, status }] as const,
}
