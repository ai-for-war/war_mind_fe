import { useQuery, type UseQueryResult } from "@tanstack/react-query"

import { stockAgentMessagesApi } from "@/features/stock-agent/api/messages-api"
import { stockAgentQueryKeys } from "@/features/stock-agent/query-keys"
import type {
  StockAgentConversationMessagesResponse,
  StockAgentMessageRecord,
} from "@/features/stock-agent/types/chat-workspace.types"
import { useActiveOrganizationId } from "@/hooks/use-active-organization-id"

type StockAgentConversationMessagesQueryResult = UseQueryResult<
  StockAgentConversationMessagesResponse,
  Error
>

type UseStockAgentConversationMessagesQueryResult = StockAgentConversationMessagesQueryResult & {
  messages: StockAgentMessageRecord[]
  isEmpty: boolean
}

export const useStockAgentConversationMessages = (
  conversationId: string | null,
): UseStockAgentConversationMessagesQueryResult => {
  const activeOrganizationId = useActiveOrganizationId()
  const hasConversationId = typeof conversationId === "string" && conversationId.length > 0
  const query = useQuery({
    enabled: hasConversationId,
    queryFn: () => stockAgentMessagesApi.listConversationMessages(conversationId as string),
    queryKey: hasConversationId
      ? stockAgentQueryKeys.conversationMessages(activeOrganizationId, conversationId)
      : stockAgentQueryKeys.conversationMessagesPlaceholder(activeOrganizationId),
  })

  const messages = query.data?.messages ?? []
  const isEmpty = !query.isPending && !query.isError && messages.length === 0

  return {
    ...query,
    isEmpty,
    messages,
  }
}
