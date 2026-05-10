import type { StockAgentConversationListParams } from "@/features/stock-agent/types/conversation.types"
import { getOrganizationQueryScope } from "@/lib/organization-query"

const STOCK_AGENT_QUERY_KEY = ["stock-agent"] as const

export const stockAgentQueryKeys = {
  all: STOCK_AGENT_QUERY_KEY,
  scoped: (organizationId?: string | null) =>
    [
      ...STOCK_AGENT_QUERY_KEY,
      "organization",
      getOrganizationQueryScope(organizationId),
    ] as const,
  conversationsAll: (organizationId?: string | null) =>
    [...stockAgentQueryKeys.scoped(organizationId), "conversations"] as const,
  conversationMessagesAll: (organizationId?: string | null) =>
    [...stockAgentQueryKeys.scoped(organizationId), "messages"] as const,
  conversationMessages: (
    organizationId: string | null | undefined,
    conversationId: string,
  ) => [...stockAgentQueryKeys.conversationMessagesAll(organizationId), conversationId] as const,
  conversationMessagesPlaceholder: (organizationId?: string | null) =>
    [...stockAgentQueryKeys.conversationMessagesAll(organizationId), "placeholder"] as const,
  conversationsList: (
    organizationId: string | null | undefined,
    { limit, search, skip, status }: StockAgentConversationListParams,
  ) =>
    [
      ...stockAgentQueryKeys.conversationsAll(organizationId),
      { limit, search, skip, status },
    ] as const,
  runtimeCatalog: (organizationId?: string | null) =>
    [...stockAgentQueryKeys.scoped(organizationId), "runtime-catalog"] as const,
}
