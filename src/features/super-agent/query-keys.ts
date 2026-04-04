import type { ConversationListParams } from "@/features/super-agent/types/conversation.types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const SUPER_AGENT_QUERY_KEY = ["super-agent"] as const

export const superAgentQueryKeys = {
  all: SUPER_AGENT_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [
      ...SUPER_AGENT_QUERY_KEY,
      "organization",
      getOrganizationQueryScope(organizationId),
    ] as const,
  conversationsAll: (organizationId?: string | null) =>
    [...superAgentQueryKeys.scoped(organizationId), "conversations"] as const,
  conversationMessagesAll: (organizationId?: string | null) =>
    [...superAgentQueryKeys.scoped(organizationId), "messages"] as const,
  conversationMessages: (
    organizationId: string | null | undefined,
    conversationId: string,
  ) => [...superAgentQueryKeys.conversationMessagesAll(organizationId), conversationId] as const,
  conversationMessagesPlaceholder: (organizationId?: string | null) =>
    [...superAgentQueryKeys.conversationMessagesAll(organizationId), "placeholder"] as const,
  conversationsList: (
    organizationId: string | null | undefined,
    { limit, search, skip, status }: ConversationListParams,
  ) =>
    [...superAgentQueryKeys.conversationsAll(organizationId), { limit, search, skip, status }] as const,
  runtimeCatalog: (organizationId?: string | null) =>
    [...superAgentQueryKeys.scoped(organizationId), "runtime-catalog"] as const,
}
